import { fabric } from "fabric";
import { imagePool } from "./imagePool";
import { IMPASSABLE_URL } from "../constants";
import { simpleOptions } from "./options";

export function createImpassableRect(options, onLoad) {
  const element = imagePool.get(IMPASSABLE_URL);

  const impassableRect = new fabric.Rect({
    ...simpleOptions,
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    fill: new fabric.Pattern({
      source: element,
      repeat: 'repeat',
    }),
  });

  if (element == null) {
    imagePool.load(IMPASSABLE_URL).then((elem) => {
      impassableRect.set('fill', new fabric.Pattern({
        source: elem,
        repeat: 'repeat',
      }));
  
      if (onLoad) onLoad();
    });
  }

  return impassableRect;
}
