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

// Copy from https://github.com/facebook/fbjs/blob/main/packages/fbjs/src/core/shallowEqual.js
export function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  
  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }
  
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}

// TODO: move geometry related util functions to geometry.js
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

export function clampRectInRect(rect1, rect2) {
  const left = clamp(rect1.left, rect2.left, rect2.left + rect2.width - rect1.width);
  const top = clamp(rect1.top, rect2.top, rect2.top + rect2.height - rect1.height);
  return { left, top, width: rect1.width, height: rect1.height };
}

export function clampTileInRect(point, rect2) {
  const x = clamp(point.x, rect2.left, rect2.left + rect2.width - TILE_SIZE);
  const y = clamp(point.y, rect2.top, rect2.top + rect2.height - TILE_SIZE);
  return { x, y };
}

export function toIntegerPoint(point) {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}
