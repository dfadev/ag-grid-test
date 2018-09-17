import React, { Component } from "react";
import { Formik, validateYupSchema, yupToFormErrors } from "formik";
import moize from "moize";
import debounce from "debounce-promise";

const validateDebounceMs = 100;
const moizeOptions = {
  isPromise: true,
  isDeepEquals: true,
  maxAge: 60000
};

// wrap Formik in order to:
// 
// - debounce form validation call using debounce-promise
//
// - memoize validation call using moize
//
// - add events:
//
//    - onValidSubmission
//    - onInvalidSubmission
//    - onSubmit (can return a promise)
//    - onReset
//
class FormWrapper extends Component {
  // execute yup validation schema, passing initial values and values as
  // context, and return as a resolved result
  handleValidate = values =>
    validateYupSchema(values, this.props.validationSchema, false, {
      initialValues: this.props.initialValues,
      values
    })
      .then(() => ({}))
      .catch(yupToFormErrors);

  // memoize the promise returned by handleValidate
  moizeValidate = moize(this.handleValidate, moizeOptions);

  // formik wants a rejected promise, but moize doesn't cache rejected promises
  wedgeValidate = v =>
    new Promise((resolve, reject) => this.moizeValidate(v).then(reject));

  // slightly debounce the validation method call
  debounceValidate = debounce(this.wedgeValidate, validateDebounceMs);

  handleSubmit = (value, formik) => {
    // validation passed -- save item and then call setSubmitting(false) to
    // enable submit button
    if (this.props.onSubmit) {
      Promise.resolve(this.props.onSubmit(formik)).then(() => {
        formik.setSubmitting(false);
      });
    } else {
      formik.setSubmitting(false);
    }
  };

  // clear memoize cache
  clearMoize = () => this.moizeValidate.clear();

  componentDidMount = this.clearMoize;

  render() {
    return (
      <Formik
        onSubmit={this.handleSubmit}
        initialValues={this.props.initialValues}
        validate={this.debounceValidate}
        render={formik => {
          const handleSubmitClick = () => {
            formik.submitForm().then(z => {
              if (formik.isValid) {
                this.props.onValidSubmission && this.props.onValidSubmission();
              } else {
                this.props.onInvalidSubmission && this.props.onInvalidSubmission();
              }
            });
          };

          const handleResetClick = () => {
            formik.resetForm();
            this.clearMoize();
            this.props.onReset && this.props.onReset();
          };

          return this.props.render({ ...formik, handleSubmitClick, handleResetClick });
        }}
      />
    );
  }
}

export default FormWrapper;
