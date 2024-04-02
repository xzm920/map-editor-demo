import { fabric } from "fabric";
import { simpleOptions } from "./options";

export function createEraser(options) {
  return new fabric.Rect({
    ...simpleOptions,
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    fill: '#000',
    opacity: 0.4,
  });
}
