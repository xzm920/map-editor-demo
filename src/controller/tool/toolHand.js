export class ToolHand {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.mapCanvas = mapEditor.view;

    this.mapCanvas.canvas.defaultCursor = 'grab';
    this.mapCanvas.canvas.hoverCursor = 'grab';
    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();  
    this.mapCanvas.canvas.defaultCursor = 'default';
    this.mapCanvas.canvas.hoverCursor = 'default';
  }

  _listen() {
    let isPanning = false;

    const handleMouseDown = () => {
      isPanning = true;
    };
    const handleMouseMove = (e) => {
      if (!isPanning) return;

      const { movementX = 0, movementY = 0 } = e.e;
      this.mapCanvas.relativePan(movementX, movementY);
    };
    const handleMouseUp = () => {
      isPanning = false;
    };

    this.mapCanvas.canvas.on('mouse:down', handleMouseDown);
    this.mapCanvas.canvas.on('mouse:move', handleMouseMove);
    this.mapCanvas.canvas.on('mouse:up', handleMouseUp);
    return () => {
      this.mapCanvas.canvas.off('mouse:down', handleMouseDown);
      this.mapCanvas.canvas.off('mouse:move', handleMouseMove);
      this.mapCanvas.canvas.off('mouse:up', handleMouseUp);
    };  
  }
}
