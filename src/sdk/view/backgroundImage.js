import { fabric } from "fabric";
import { imagePool } from "./imagePool";
import { backgroundImageOptions } from "./options";
import { backgroundImageControls } from "./controls";

export function createBackgroundImage(options, onLoad) {
  const element = imagePool.get(options.imageURL);

  const bgImage = new fabric.Image(element, {
    ...backgroundImageOptions,
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    scaleX: options.scaleX,
    scaleY: options.scaleY,
  });

  bgImage.controls = backgroundImageControls;

  if (element == null) {
    imagePool.load(options.imageURL).then((elem) => {
      bgImage.setElement(elem);

      if (onLoad) onLoad();
    });
  }

  return bgImage;
}
