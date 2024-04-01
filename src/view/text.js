import { fabric } from "fabric";
import { textControls } from "./controls";
import { textOptions } from "./options";

export function createText(options) {
  const textbox = new fabric.Textbox(options.text, {
    ...textOptions,
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    angle: options.angle,
    fontSize: options.fontSize,
    fill: options.fill,
    opacity: options.opacity,
    fontStyle: options.fontStyle,
    fontWeight: options.fontWeight,
    underline: options.underline,
    textAlign: options.textAlign,
    lineHeight: options.lineHeight,
  });

  textbox.controls = textControls;

  return textbox;
}
