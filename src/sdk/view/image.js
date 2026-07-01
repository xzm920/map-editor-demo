import { fabric } from "fabric";
import { imagePool } from "./imagePool";
import { imageOptions } from "./options";
import { imageControls } from "./controls";

export function createImage(options, onLoad) {
  const element = imagePool.get(options.imageURL);

  const image = new fabric.Image(element, {
    ...imageOptions,
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    angle: options.angle,
    scaleX: options.scaleX,
    scaleY: options.scaleY,
    flipX: options.flipX,
    flipY: options.flipY,
    opacity: options.opacity,
  });

  image.controls = imageControls;

  if (element == null) {
    imagePool.load(options.imageURL).then((element) => {
      image.setElement(element);

      if (onLoad) onLoad();
    });
  }

  return image;
}
