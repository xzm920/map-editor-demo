import { EVENT } from "../../event";

export class ToolManager {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.toolMap = new Map();
    this.current = null;
    this.currentTool = null;
  }

  registerTool(name, ToolCtor) {
    this.toolMap.set(name, ToolCtor);
  }

  invokeTool(name) {
    if (this.current) {
      this.stopTool();
    }
    const ToolCtor = this.toolMap.get(name);
    this.current = name;
    this.currentTool = new ToolCtor(this.mapEditor);

    this.mapEditor.emit(EVENT.toolChange, { tool: this.current });
  }

  stopTool() {
    if (this.current) {
      this.current = null;
      this.currentTool.dispose();
      this.currentTool = null;
    }
  }
}
