import { fabric } from "fabric";
import { textOptions } from "./config";
import { DEFAULT_LINE_HEIGHT } from "../constants";

export class TextView {
  constructor(model) {
    this.parent = null;
    this.model = model;
    this.object = null;
    
    this.addObject(model);
  }

  addObject(model) {
    this.object = new fabric.Textbox(model.content, {
      left: model.left,
      top: model.top,
      width: model.width,
      height: model.height,
      angle: model.angle,
      fontSize: model.fontSize,
      fill: model.color,
      opacity: model.opacity,
      fontStyle: transformItalic(model.isItalic),
      fontWeight: transformBold(model.isBold),
      underline: model.isUnderline,
      textAlign: transformAlign(model.horizontalAlign),
      lineHeight: transformLineHeight(model.lineHeight, model.fontSize),
      ...textOptions,
    });
  }

  updateObject(model) {
    this.object.set({
      text: model.content,
      left: model.left,
      top: model.top,
      width: model.width,
      height: model.height,
      angle: model.angle,
      fontSize: model.fontSize,
      fill: model.color,
      opacity: model.opacity,
      fontStyle: transformItalic(model.isItalic),
      fontWeight: transformBold(model.isBold),
      underline: model.isUnderline,
      textAlign: transformAlign(model.horizontalAlign),
      lineHeight: transformLineHeight(model.lineHeight, model.fontSize),
    });
  }

  render() {
    this.updateObject(this.model);
    this.parent?.onUpdate();
  }
}

function transformItalic(isItalic) {
  return isItalic ? 'italic' : 'normal';
}

function transformBold(isBold) {
  return isBold ? 700 : 400;
}

function transformAlign(horizontalAlign) {
  return horizontalAlign.toLowerCase();
}

function transformLineHeight(lineHeight, fontSize) {
  return lineHeight === null ? DEFAULT_LINE_HEIGHT : lineHeight / fontSize;
}
