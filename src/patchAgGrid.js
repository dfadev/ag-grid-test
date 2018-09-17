import { CellComp } from "ag-grid-community";

// prevent extra focus call when a popup editor is closed
CellComp.prototype.onPopupEditorClosed = function () {
  if (this.editingCell) {
    this.stopRowOrCellEdit();
  }
};

