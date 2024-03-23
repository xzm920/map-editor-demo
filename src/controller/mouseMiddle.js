export class MouseMiddle {
  constructor(mapCanvas) {
    this.mapCanvas = mapCanvas;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const handleMouseMove = (e) => {
      // 按住Ctrl键和鼠标左键拖动画布；按住鼠标中键拖动画布
      if (e.e.buttons === 4) {
        this.mapCanvas.relativePan(e.e.movementX, e.e.movementY);
      }
    };

    this.mapCanvas.canvas.on('mouse:move', handleMouseMove);
    return () => {
      this.mapCanvas.canvas.off('mouse:move', handleMouseMove);
    };
  }
}
