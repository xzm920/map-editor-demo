import { fabric } from "fabric";
import { TILE_SIZE } from "../constants";
import { simpleOptions } from "./options";

export function createMask(width, height) {
  return new fabric.Rect({
    ...simpleOptions,
    fill: '#282C4A',
    opacity: 0.3,
    left: 0,
    top: 0,
    width: TILE_SIZE * width,
    height: TILE_SIZE * height,
  });
}
