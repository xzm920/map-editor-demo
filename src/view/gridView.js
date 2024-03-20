import { fabric } from "fabric";
import { TILE_SIZE } from "../constants";
import { fetchImage } from "../utils";

export class GridView {
  constructor(width, height) {
    this.parent = null;
    this.object = new fabric.Image(null, {
      left: -0.5,
      top: -0.5,
      width: TILE_SIZE * width + 1,
      height: TILE_SIZE * height + 1,
      selectable: false,
      evented: false,
    });
    const url = createGridSVGUrl(width, height);
    fetchImage(url).then((elem) => {
      this.object.setElement(elem);
      this.parent?.onLoad();
    });
  }
}

function createGridSVGUrl(width, height) {
  let svgStr = '';
  const widthPx = width * TILE_SIZE + 1;
  const heightPx = height * TILE_SIZE + 1;
  svgStr += `<svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" fill="none" style="stroke: rgb(207,207,207);" xmlns="http://www.w3.org/2000/svg">`;
  for (let i = 0; i <= width; i += 1) {
    const x1 = 0.5 + i * TILE_SIZE;
    const y1 = 0.5;
    const x2 = 0.5 + i * TILE_SIZE;
    const y2 = 0.5 + height * TILE_SIZE;
    const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    svgStr += line;
  }
  for (let j = 0; j <= height; j += 1) {
    const x1 = 0.5;
    const y1 = 0.5 + j * TILE_SIZE;
    const x2 = 0.5 + width * TILE_SIZE;
    const y2 = 0.5 + j * TILE_SIZE;
    const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    svgStr += line;
  }
  svgStr += '</svg>';
  return `data:image/svg+xml,${svgStr}`;
}
