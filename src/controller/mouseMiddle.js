export class MouseMiddle {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const { canvas } = this.mapEditor;
    let lastCursor = null;
    
    const handleMouseDown = (e) => {
      if (e.buttons === 4) {
        lastCursor = canvas.defaultCursor;
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        canvas.upperCanvasEl.style.cursor = 'grab';
      }
    };

    const handleMouseMove = (e) => {
      if (e.buttons === 4) {
        this.mapEditor.relativePan(e.movementX, e.movementY);
      }
    };

    const handleMouseUp = () => {
      if (lastCursor) {
        canvas.defaultCursor = lastCursor;
        canvas.hoverCursor = lastCursor;
        canvas.upperCanvasEl.style.cursor = lastCursor;
        lastCursor = null;
      }
    };

    canvas.upperCanvasEl.addEventListener('mousedown', handleMouseDown);
    canvas.upperCanvasEl.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      canvas.upperCanvasEl.removeEventListener('mousedown', handleMouseDown);
      canvas.upperCanvasEl.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }
}
