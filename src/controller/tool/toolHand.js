export class ToolHand {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this.mapEditor.canvas.defaultCursor = 'grab';
    this.mapEditor.canvas.hoverCursor = 'grab';
    this._unlisten = this._listen();
  }

  dispose() {
    this.mapEditor.canvas.defaultCursor = 'default';
    this.mapEditor.canvas.hoverCursor = 'default';
    this._unlisten();
  }

  _listen() {
    let isPanning = false;

    const handleMouseDown = () => {
      isPanning = true;
    };
    const handleMouseMove = (e) => {
      if (!isPanning) return;

      const { movementX = 0, movementY = 0 } = e.e;
      this.mapEditor.relativePan(movementX, movementY);
    };
    const handleMouseUp = () => {
      isPanning = false;
    };

    this.mapEditor.canvas.on('mouse:down', handleMouseDown);
    this.mapEditor.canvas.on('mouse:move', handleMouseMove);
    this.mapEditor.canvas.on('mouse:up', handleMouseUp);
    return () => {
      this.mapEditor.canvas.off('mouse:down', handleMouseDown);
      this.mapEditor.canvas.off('mouse:move', handleMouseMove);
      this.mapEditor.canvas.off('mouse:up', handleMouseUp);
    };  
  }
}
