/** @format **/
import React, { Component } from "react";
import { getIn, FieldArray } from "formik";
import { default as CellRenderer } from "./CellRenderer";
import { default as PopupEditor } from "./PopupEditor";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

const keyList = ["Tab", "ArrowUp", "ArrowDown", "Enter"];

export default class FormData extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gridOptions: {
        defaultColDef: {
          cellEditorFramework: PopupEditor,
          cellRendererFramework: CellRenderer,
          cellRendererParams: params => {
            const { rowIndex, colDef } = params;
            //const { value, listName, rowIndex, colDef, getError, getTouched } = props;
            const fieldName = `${this.props.name}[${rowIndex}]${colDef.field}`;
            const error = this.getError(fieldName);
            const touched = this.getTouched(fieldName);

            const rslt = { fieldName, error, touched };
            console.log("get cellRendererParams", rslt);
            return rslt;
          },
          // ag-grid must use formik to set values
          valueSetter: params => {
            this.props.setFieldValue(
              `${this.props.name}[${params.node.rowIndex}]${
                params.colDef.field
              }`,
              params.newValue,
              true
            );
            return true; // must return false to let Formik update value?
          },
          suppressKeyboardEvent: event => {
            if (keyList.includes(event.event.key)) return false;
            if (event.editing) return true;
          }
        },
        singleClickEdit: true,
        //suppressCellSelection: true,
        //suppressRowHoverHighlight: true,
        onCellValueChanged: this.handleCellValueChanged,
        onCellEditingStopped: this.handleCellEditingStopped,
        onGridReady: this.handleGridReady,
        suppressFocusAfterRefresh: true,
        stopEditingWhenGridLosesFocus: true
      }
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { name, values, errors, touched } = this.props;
    const {
      name: prevName,
      values: prevValues,
      errors: prevErrors,
      touched: prevTouched
    } = prevProps;

    if (
      getIn(prevValues, prevName) !== getIn(values, name) ||
      getIn(prevErrors, prevName) !== getIn(errors, name) ||
      getIn(prevTouched, prevName) !== getIn(touched, name)
    ) {
      this.gridApi && this.gridApi.refreshCells({ force: true });
    }
  }

  handleGridReady = e => {
    this.gridApi = e.api;
    this.columnApi = e.columnApi;
  };

  handleCellValueChanged = e => {
    //throw new Error(
    //"ag-grid not allowed to change cell value, use a valueSetter"
    //);
  };

  handleCellEditingStopped = e => {
    this.props.setFieldTouched(
      `${this.props.name}[${e.rowIndex}]${e.colDef.field}`,
      true, // touched
      false // shouldValidate
    );
  };

  getError = fieldName => {
    return getIn(this.props.errors, fieldName);
  };

  getTouched = fieldName => {
    return getIn(this.props.touched, fieldName);
  };

  render() {
    return (
      <React.Fragment>
        <FieldArray
          name={this.props.name}
          render={faProps => {
            const handleAdd = () => {
              faProps.push(this.props.getNewRow());
              // formik manages touched and errors in this case
            };

            const handleAddFirst = () => {
              faProps.insert(0, this.props.getNewRow());
              // need to update formik touched in this case
              const touched = getIn(this.props.touched, this.props.name);
              if (!touched) return;
              const touchedCopy = [...touched];
              touchedCopy.splice(0, 0, undefined);
              delete touchedCopy[0];
              this.props.setFieldTouched(this.props.name, touchedCopy, false);
            };

            const handleRemoveFirst = () => {
              faProps.remove(0);
              // formik manages touched and errors in this case
            };

            const handleRemoveLast = () => {
              faProps.remove(this.props.values[this.props.name].length - 1);
              // formik manages touched and errors in this case
            };

            return (
              <React.Fragment>
                <div
                  className="ag-theme-balham"
                  style={{
                    height: "500px",
                    width: "605px"
                  }}
                >
                  <AgGridReact
                    gridOptions={this.state.gridOptions}
                    columnDefs={this.props.columnDefs}
                    rowData={this.props.values[this.props.name]}
                  />
                </div>
                <div>
                  <input
                    type="button"
                    onClick={handleAddFirst}
                    value="Add First"
                  />
                  <input type="button" onClick={handleAdd} value="Add Last" />
                  <input
                    type="button"
                    onClick={handleRemoveFirst}
                    value="Remove First"
                  />
                  <input
                    type="button"
                    onClick={handleRemoveLast}
                    value="Remove Last"
                  />
                </div>
              </React.Fragment>
            );
          }}
        />
      </React.Fragment>
    );
  }
}
