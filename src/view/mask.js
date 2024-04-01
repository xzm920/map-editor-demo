import { fabric } from "fabric";
import { TILE_SIZE } from "../constants";

export function createMask(width, height) {
  return new fabric.Rect({
    fill: '#282C4A',
    opacity: 0.3,
    selectable: false,
    evented: false,
    left: 0,
    top: 0,
    width: TILE_SIZE * width,
    height: TILE_SIZE * height,
  });
}
