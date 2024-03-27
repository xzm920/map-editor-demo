import { fabric } from "fabric";
import { textOptions } from "./config";
import { DEFAULT_LINE_HEIGHT } from "../constants";
import { textControls } from "./controls";

export class TextView {
  constructor(model) {
    this.parent = null;
    this.model = model;
    this.object = null;
    
    this.addObject(model);
  }

  addObject(model) {
    this.object = new fabric.Textbox(model.text, {
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
    this.object.set({
      padding: 6,
      hasControls: true,
    });
    this.object.controls = textControls;
  }

  updateObject(model) {
    this.object.set({
      text: model.text,
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

  syncModel() {
    this.updateObject(this.model);
    this.parent?.onUpdate();
  }

  get isEditing() {
    return this.object.isEditing;
  }

  enterEditing() {
    this.object.enterEditing();
  }

  exitEditing() {
    this.object.exitEditing();
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
