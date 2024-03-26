import { v4 } from "uuid";
import { TILE_SIZE } from "./constants";
import { clamp } from "lodash";

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

export function getRectOffsetToClosestTile(rect, threshold) {
  const offsetLeft = getOffsetToClosedTile(rect.left, threshold);
  const offsetRight = getOffsetToClosedTile(rect.left + rect.width, threshold);
  const offsetTop = getOffsetToClosedTile(rect.top, threshold);
  const offsetBottom = getOffsetToClosedTile(rect.top + rect.height, threshold);
  const minOffsetX = Math.abs(offsetLeft) <= Math.abs(offsetRight) ? offsetLeft : offsetRight;
  const minOffsetY = Math.abs(offsetTop) <= Math.abs(offsetBottom) ? offsetTop : offsetBottom;
  const offsetX = Math.abs(minOffsetX) <= threshold ? minOffsetX : 0;
  const offsetY = Math.abs(minOffsetY) <= threshold ? minOffsetY : 0;
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

export function clampTileInRect(point, rect2) {
  const x = clamp(point.x, rect2.left, rect2.left + rect2.width - TILE_SIZE);
  const y = clamp(point.y, rect2.top, rect2.top + rect2.height - TILE_SIZE);
  return { x, y };
}
