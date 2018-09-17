import React, { Component } from "react";

// functional CellRenderer does not work correctly
export default class CellRenderer extends Component {
  render() {
    const { fieldName, error, touched, value } = this.props;
    return (
      <React.Fragment>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>{value}</div>
          {touched && error &&
            <div style={{ color: "red", marginLeft: "0.25em" }}><small>{error}</small></div>
          }
        </div>
      </React.Fragment>
    );
  };
}
