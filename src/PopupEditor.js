import React, { Component } from "react";
import ReactDOM from "react-dom";

export default class PopupEditor extends Component {
  componentDidMount = () => this.focus();
  input = React.createRef();
  state = { value: this.props.charPress || this.props.value };
  getValue = () => this.state.value;
  isPopup = () => true;
  onChange = e => this.setState({ value: e.target.value });
  focus = () =>
    setTimeout(
      () => this.input && this.input.current && this.input.current.focus()
    );

  render() {
    const editorWidth = this.props.eGridCell.clientWidth;
    const editorHeight = this.props.eGridCell.clientHeight;
    return (
      <input
        ref={this.input}
        type="text"
        value={this.state.value}
        onChange={this.onChange}
        style={{ boxSizing: "border-box", width: `${editorWidth}px`, height: `${editorHeight}px` }}
      />
    );
  }
}
