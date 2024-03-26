import { TOOL } from '../../constants';
import { createText } from '../../model/create';
import { clampRectInRect, toIntegerPoint } from '../../utils';

export class ToolText {
  
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.mapContainer = this.mapEditor.model;
    this.mapCanvas = mapEditor.view;

    if (this.mapCanvas.showMask) {
      this.mapCanvas.toggleMask();
    }
    
    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const handleMouseDown = (e) => {
      const point = toIntegerPoint(e.absolutePointer);
      const width = 100;
      const height = 28;
      let rect = { left: point.x, top: point.y, width, height };
      rect = clampRectInRect(rect, this.mapContainer.bbox);
      const text = createText('', rect.left, rect.top, rect.width, rect.height);
      this.mapEditor.startBatch();
      this.mapContainer.add(text);

      this.mapEditor.toolManager.invokeTool(TOOL.select);
      this.mapEditor.selection.select(text);
      const textView = this.mapCanvas.getItemView(text);
      textView.enterEditing();
    };

    this.mapCanvas.canvas.on('mouse:down', handleMouseDown);
    return () => {
      this.mapCanvas.canvas.off('mouse:down', handleMouseDown);
    };
  }
}
