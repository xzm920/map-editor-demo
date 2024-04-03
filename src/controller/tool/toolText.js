import { TOOL } from '../../constants';
import { createText } from '../../model/create';
import { clampRectInRect, toIntegerPoint } from '../../utils';

export class ToolText {
  
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    if (this.mapEditor.showMask) {
      this.mapEditor.setMask(false);
    }
    
    this.mapEditor.canvas.defaultCursor = 'text';
    this.mapEditor.canvas.hoverCursor = 'text';

    this._unlisten = this._listen();
  }

  dispose() {
    this.mapEditor.canvas.defaultCursor = 'default';
    this.mapEditor.canvas.hoverCursor = 'default';

    this._unlisten();
  }

  _listen() {
    const handleMouseDown = (e) => {
      const point = toIntegerPoint(e.absolutePointer);
      const width = 100;
      const height = 28;
      let rect = { left: point.x, top: point.y, width, height };
      rect = clampRectInRect(rect, this.mapEditor.model.bbox);
      const text = createText('', rect.left, rect.top, rect.width, rect.height);
      this.mapEditor.add(text);

      this.mapEditor.invokeTool(TOOL.select);
      this.mapEditor.select(text);
      const textObject = this.mapEditor.getViewByItem(text);
      textObject.enterEditing();
      // TODO: 处理空文字删除的问题
    };

    this.mapEditor.canvas.on('mouse:down', handleMouseDown);
    return () => {
      this.mapEditor.canvas.off('mouse:down', handleMouseDown);
    };
  }
}
