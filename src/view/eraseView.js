import { fabric } from "fabric";

export class EraserView {
  constructor(width, height) {
    this.parent = null;
    this.object = new fabric.Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: '#000',
      opacity: 0.4,
      selectable: false,
      evented: false,
      visible: false,
    });
  }

  setVisible(visible) {
    this.object.set({ visible });
  }

  setPosition(left, top) {
    this.object.set({ left, top });
  }
}
