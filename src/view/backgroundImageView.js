import { fabric } from "fabric";
import { imagePool } from "./imagePool";
import { baseOptions } from "./config";
import { backgroundImageControls } from "./controls";

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
    this.object.set({
      lockScalingFlip: true,
      padding: 6,
      hasControls: true,
    });
    this.object.controls = backgroundImageControls;
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

  syncModel() {
    this.updateObject(this.model);
    this.parent?.onUpdate();
  }
}
