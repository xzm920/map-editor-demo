import { fabric } from "fabric";

export class MaskView {
  constructor(parent) {
    this.parent = parent;

    this.object = new fabric.Rect({
      selectable: false,
      evented: false,
      fill: '#282C4A',
      opacity: 0.3,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
  }

  update() {
    const { left, top, width, height } = this.calcPositionSize();
    this.object.set({ left, top, width, height });
  }

  calcPositionSize() {
    const { invertTransform, qrDecompose } = fabric.util;
    const vpt = this.parent.canvas.viewportTransform;
    const invertedVpt = invertTransform(vpt);
    const { scaleX, scaleY, translateX, translateY } = qrDecompose(invertedVpt);
    return {
      left: translateX,
      top: translateY,
      width: this.parent.canvasWidth * scaleX,
      height: this.parent.canvasHeight * scaleY,
    };
  }
}
