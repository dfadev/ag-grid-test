import React, { Component } from "react";
import { Field, ErrorMessage } from "formik";

export default class FormField extends Component {
  render() {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "0.25em" }}>
          {this.props.label}
        </div>
        <div>
          <Field name={this.props.name} />
        </div>
        <div style={{ color: "red", marginLeft: "0.25em" }}>
          <small style={{ fontSize: "x-small" }}>
            <ErrorMessage name={this.props.name} />
          </small>
        </div>
      </div>
    );
  }
}
