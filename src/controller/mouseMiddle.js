import { isCtrlOrCommandKey } from "../env";

export class MouseMiddle {
  constructor(mapCanvas) {
    this.mapCanvas = mapCanvas;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    let panning = false;
    const handleMouseDown = () => {
      panning = true;
    };
    const handleMouseMove = (e) => {
      // 按住Ctrl键和鼠标左键拖动画布；按住鼠标中键拖动画布
      if ((panning && isCtrlOrCommandKey(e.e)) || e.e.buttons === 4) {
        this.mapCanvas.relativePan(e.e.movementX, e.e.movementY);
      }
    };
    const handleMouseUp = () => {
      panning = false;
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
