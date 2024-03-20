import { fabric } from "fabric";
import { imagePool } from "./imagePool";
import { baseOptions } from "./config";

export class ImpassableView {
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
      width: model.width,
      height: model.height,
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
    });
  }

  render() {
    this.updateObject(this.model);
    this.parent?.onUpdate();
  }
}
