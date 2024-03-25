import { v4 } from "uuid";
import { TILE_SIZE } from "./constants";

export const uuid = v4;

export function patchToChanges(object, patch) {
  return Object.keys(patch).map((key) => ({
    key,
    prev: object[key],
    next: patch[key],
  }));
}

export function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const imgElem = new Image();
    imgElem.setAttribute('crossOrigin', 'anonymous');
    imgElem.src = url;
    imgElem.onload = () => {
      resolve(imgElem);
    };
    imgElem.onerror = (err) => {
      reject(err);
    };
  });
}

export function toTiledPoint(point) {
  return {
    x: toTiledCoord(point.x),
    y: toTiledCoord(point.y),
  };
}

export function toTiledCoord(x) {
  if (x % TILE_SIZE === 0) return x;
  return Math.floor(x / TILE_SIZE) * TILE_SIZE;
}

export function clamp(val, min, max) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

const { abs } = Math;

export function getRectOffsetToClosestTile(rect, threshold) {
  const offsetLeft = getOffsetToClosedTile(rect.left, threshold);
  const offsetRight = getOffsetToClosedTile(rect.left + rect.width, threshold);
  const offsetTop = getOffsetToClosedTile(rect.top, threshold);
  const offsetBottom = getOffsetToClosedTile(rect.top + rect.height, threshold);
  const minOffsetX = abs(offsetLeft) <= abs(offsetRight) ? offsetLeft : offsetRight;
  const minOffsetY = abs(offsetTop) <= abs(offsetBottom) ? offsetTop : offsetBottom;
  const offsetX = abs(minOffsetX) <= threshold ? minOffsetX : 0;
  const offsetY = abs(minOffsetY) <= threshold ? minOffsetY : 0;
  return { offsetX, offsetY };
}

function getOffsetToClosedTile(coord) {
  const gridNum = Math.floor(coord / TILE_SIZE);
  const offsetToLowTile = gridNum * TILE_SIZE - coord;
  const offsetToHighTile = (gridNum + 1) * TILE_SIZE - coord;
  return Math.abs(offsetToLowTile) <= Math.abs(offsetToHighTile)
    ? offsetToLowTile
    : offsetToHighTile;
}
