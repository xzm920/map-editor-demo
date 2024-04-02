import { fabric } from "fabric";
import { THEME } from "../constants";
import { simpleOptions } from "./options";

export function createSelection() {
  return new fabric.Rect({
    ...simpleOptions,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    fill: THEME.primaryColor,
    opacity: 0.6,
  });
}
