import { fabric } from "fabric";
import { imagePool } from "./imagePool";
import { baseOptions } from "./config";
import { IMPASSABLE_URL } from "../constants";

export class TiledObjectView {
  constructor(model) {
    this.parent = null;
    this.model = model;
    this.object = null;
    this.impassableObject = null;
    
    this.addObject(model);
    if (model.isCollider) {
      this.addImpassable(model);
    }
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

  addImpassable(model) {
    this.impassableObject = new fabric.Rect({
      left: model.left,
      top: model.top,
      width: model.width,
      height: model.height,
      ...baseOptions,
      evented: false,
    });
    imagePool.load(IMPASSABLE_URL).then((elem) => {
      this.impassableObject.set('fill', new fabric.Pattern({
        source: elem,
        repeat: 'repeat',
      }));
      this.parent?.onLoad();
    });
  }

  removeImpassable() {
    this.impassableObject = null;
  }

  updateImpassable(model) {
    this.impassableObject.set({
      left: model.left,
      top: model.top,
    });
  }

  render() {
    this.updateObject(this.model);
    
    if (this.model.isCollider && !this.impassableObject) {
      this.addImpassable(this.model);
    } else if (this.model.isCollider && this.impassableObject) {
      this.updateImpassable(this.model);
    } else if (!this.model.isCollider && this.impassableObject) {
      this.removeImpassable();
    }

    this.parent?.onUpdate();
  }
}
