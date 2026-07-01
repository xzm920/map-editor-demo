import { EVENT } from "../../event";
import { shallowEqual } from "../../utils";

export class ToolManager {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.toolMap = new Map();
    this.current = null;
    this.currentOptions = {};
    this.currentTool = null;
  }

  registerTool(name, ToolCtor) {
    this.toolMap.set(name, ToolCtor);
  }

  invokeTool(name, options = {}) {
    if (name === this.current && shallowEqual(options, this.currentOptions)) return;

    if (this.current) {
      this.stopTool();
    }
    const ToolCtor = this.toolMap.get(name);
    if (!ToolCtor) {
      throw Error(`Tool is not registered: ${name}`);
    }
    this.current = name;
    this.currentOptions = options;
    this.currentTool = new ToolCtor(this.mapEditor, options);

    this.mapEditor.emit(EVENT.toolChange, { tool: this.current });
  }

  stopTool() {
    if (this.current) {
      this.current = null;
      this.currentOptions = {};
      this.currentTool.dispose();
      this.currentTool = null;
    }
  }
}
