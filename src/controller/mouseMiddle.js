export class MouseMiddle {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const handleMouseMove = (e) => {
      // 按住Ctrl键和鼠标左键拖动画布；按住鼠标中键拖动画布
      if (e.e.buttons === 4) {
        this.mapEditor.relativePan(e.e.movementX, e.e.movementY);
      }
    };

    this.mapEditor.canvas.on('mouse:move', handleMouseMove);
    return () => {
      this.mapEditor.canvas.off('mouse:move', handleMouseMove);
    };
  }
}
