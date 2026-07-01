import { fabric } from "fabric";
import { selectionControls } from "./controls";
import { activeSelectionOptions } from "./options";

export function createActiveSelection(objects) {
  const activeSelection = new fabric.ActiveSelection(objects, {
    ...activeSelectionOptions,
  });

  activeSelection.controls = selectionControls;

  return activeSelection;
}
