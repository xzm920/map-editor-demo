import { fabric } from "fabric";
import { imagePool } from "./imagePool";
import { baseOptions } from "./config";

export class BackgroundImageView {
  constructor(model) {
    this.parent = null;
    this.model = model;
    this.object = null;

    this.addObject(model);
  }

  addObject(model) {
    const imgElem = imagePool.get(model.imageURL);
    this.object = new fabric.Image(imgElem, {
      left: model.left,
      top: model.top,
      width: model.imageWidth,
      height: model.imageHeight,
      scaleX: model.width / model.imageWidth,
      scaleY: model.height / model.imageHeight,
      ...baseOptions,
    });
    if (imgElem == null) {
      imagePool.load(model.imageURL).then((elem) => {
        this.object.setElement(elem);
        this.parent?.onLoad();
      });
    }
  }

  updateObject(model) {
    this.object.set({
      left: model.left,
      top: model.top,
      scaleX: model.width / model.imageWidth,
      scaleY: model.height / model.imageHeight,
    });
  }

  render() {
    this.updateObject(this.model);
    this.parent?.onUpdate();
  }
}
