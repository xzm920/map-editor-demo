import { fabric } from "fabric";
import { simpleOptions } from './options';
import { imagePool } from "./imagePool";
import NotAllowed from '../assets/not-allowed.png';

export function createNotAllowed(options, onLoad) {
  const {
    angle,
    left,
    top,
    width,
    height,
  } = options;

  const rect = new fabric.Rect({
    originX: 'center',
    originY: 'center',
    width,
    height,
    fill: 'rgba(227, 77, 89, 0.6)',
  });

  const element = imagePool.get(NotAllowed);
  const image = new fabric.Image(element, {
    originX: 'center',
    originY: 'center',
    width: 128,
    height: 128,
    scaleX: 0.5,
    scaleY: 0.5,
  });
  if (element == null) {
    imagePool.load(NotAllowed).then((elem) => {
      image.setElement(elem);
      if (onLoad) onLoad();
    });
  }

  return new fabric.Group([rect, image], {
    ...simpleOptions,
    angle,
    left,
    top,
    width,
    height,
  });
}

export function updateNotAllowed(notAllowed, options) {
  notAllowed.set(options);
  notAllowed.item(0).set({ width: options.width, height: options.height });
}
