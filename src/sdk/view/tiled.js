import { fabric } from "fabric";
import { imagePool } from "./imagePool";
import { tiledOptions } from "./options";

export function createTiled(options, onLoad) {
  const element = imagePool.get(options.imageURL);

  const tiled = new fabric.Image(element, {
    ...tiledOptions,
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
  });

  if (element == null) {
    imagePool.load(options.imageURL).then((elem) => {
      tiled.setElement(elem);

      if (onLoad) onLoad();
    });
  }

  return tiled;
}
