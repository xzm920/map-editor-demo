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

export function snapPointToGrid(point) {
  const x = Math.floor(point.x / TILE_SIZE) * TILE_SIZE;
  const y = Math.floor(point.y / TILE_SIZE) * TILE_SIZE;
  return { x, y };
}
