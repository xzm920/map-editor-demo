import { TOOL } from "../constants";

export class KeyboardShortcuts {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _removeSelected() {
    const { items } = this.mapEditor.selection;
    if (items.length === 0) return;

    this.mapEditor.startBatch();
    for (let item of items) {
      this.mapEditor.remove(item);
    }
    this.mapEditor.stopBatch();
  }

  _undo() {
    this.mapEditor.undo();
  }

  _redo() {
    this.mapEditor.redo();
  }

  _useSelectTool() {
    this.mapEditor.invokeTool(TOOL.select);
  }

  _useEraseTool() {
    this.mapEditor.invokeTool(TOOL.erase);
  }

  _useHandTool() {
    this.mapEditor.invokeTool(TOOL.hand);
  }

  _useTextTool() {
    this.mapEditor.invokeTool(TOOL.text);
  }

  _listen() {
    // TODO: 兼容Mac按键
    const handleKeyDown = (e) => {
      if (['TEXTAREA', 'INPUT'].includes(e.target.tagName)) return;

      if (e.code === 'Backspace' || e.code === 'Delete') {
        this._removeSelected();
      } else if (e.code === 'KeyZ' && e.ctrlKey) {
        if (e.shiftKey) {
          this._redo();
        } else {
          this._undo();
        } 
      } else if (e.code === 'KeyV') {
        this._useSelectTool();
      } else if (e.code === 'KeyE') {
        this._useEraseTool();
      } else if (e.code === 'KeyH') {
        this._useHandTool();
      } else if (e.code === 'KeyT') {
        this._useTextTool();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }
}
