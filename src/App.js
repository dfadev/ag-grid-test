import React, { Component } from "react";
import moize from "moize";
import { string, object, array, number } from "yup";
import { default as FormData } from "./FormData";
import { default as FormField } from "./FormField";
import { default as FormWrapper } from "./FormWrapper";
import "./App.css";

const moizeOptions = {
  isPromise: true,
  isDeepEquals: true,
  maxAge: 60000
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // formik initial state
      initialValues: {
        name: "blah",
        list: [
          { make: "Toyota", model: "Celica", price: 35000 },
          { make: "Ford", model: "Mondeo", price: 32000 },
          { make: "Porsche", model: "Boxter", price: 72000 }
        ]
      },
      getNewRow: () => ({
        make: "",
        model: "",
        price: ""
      }),
      // ag-grid column definitions
      columnDefs: [
        {
          headerName: "Make",
          field: "make",
          editable: true
        },
        {
          headerName: "Model",
          field: "model",
          editable: true
        },
        {
          headerName: "Price",
          field: "price",
          editable: true
        }
      ],
      // yup validation schema
      validationSchema: object().shape({
        name: string()
          .ensure()
          .required("required")
          .min(5, "too short")
          // memoized validation test
          .test("abc", "abc is invalid", this.moizeApiTest)
          .default(""),
        list: array().of(
          object().shape({
            make: string("must be a string")
              .required("required")
              .min(3, "too short")
              .default(""),
            model: string("must be a string")
              .required("required")
              .min(2, "too short")
              .default(""),
            price: number()
              .typeError("must be a number")
              .positive("must be positive")
              .required("required")
              .max(50000, "too high")
              .default(0)
          })
        )
      })
    };
  }

  // simulated api validation test
  apiTest = val => {
    console.log("apiTest", val);
    return new Promise(resolve => {
      setTimeout(() => {
        console.log("testing done");
        resolve(val !== "abc");
      }, 500);
    });
  };

  // memoized api validation test
  moizeApiTest = moize(this.apiTest, moizeOptions);

  handleValidSubmission = () => {
    console.log("valid submission");
  };

  handleInvalidSubmission = () => {
    console.log("invalid submission");
  };

  // simulate an externally delayed submit
  handleSubmit = () => {
    console.log("handle submit");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("done submitting");
        resolve();
      }, 2000);
    });
  };

  handleReset = () => {
    this.moizeApiTest.clear();
  };

  render() {
    return (
      <FormWrapper
        onReset={this.handleReset}
        onSubmit={this.handleSubmit}
        onValidSubmission={this.handleValidSubmission}
        onInvalidSubmission={this.handleInvalidSubmission}
        initialValues={this.state.initialValues}
        validationSchema={this.state.validationSchema}
        render={formik => {
          return (
            <React.Fragment>
              <FormField name="name" label="name:" />
              <FormData
                name="list"
                columnDefs={this.state.columnDefs}
                getNewRow={this.state.getNewRow}
                {...formik}
              />
              <input
                type="submit"
                value="Submit"
                disabled={formik.isSubmitting}
                onClick={formik.handleSubmitClick}
              />
              <input
                type="reset"
                value="Reset"
                disabled={formik.isSubmitting}
                onClick={formik.handleResetClick}
              />
            </React.Fragment>
          );
        }}
      />
    );
  }
}

export default App;
