import { fabric } from "fabric";
import { TILE_SIZE } from "../constants";

export function createBackgroundColor(width, height) {
  return new fabric.Rect({
    left: 0,
    top: 0,
    width: TILE_SIZE * width,
    height: TILE_SIZE * height,
    fill: '#fff',
    selectable: false,
    evented: false,
  });
}
