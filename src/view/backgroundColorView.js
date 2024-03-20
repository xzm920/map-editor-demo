import { fabric } from "fabric";
import { TILE_SIZE } from "../constants";

export class BackgroundColorView {
  constructor(width, height) {
    this.parent = null;
    this.object = new fabric.Rect({
      left: 0,
      top: 0,
      width: TILE_SIZE * width,
      height: TILE_SIZE * height,
      fill: '#fff',
      selectable: false,
      evented: false,
    });
  }
}
