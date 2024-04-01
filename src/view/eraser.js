import { fabric } from "fabric";

export function createEraser(options) {
  return new fabric.Rect({
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    fill: '#000',
    opacity: 0.4,
    selectable: false,
    evented: false,
  });
}
