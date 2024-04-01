import { fabric } from "fabric";

export function createCanvas(el, width, height) {
  const options = {
    width,
    height,
    stopContextMenu: true,
    preserveObjectStacking: true,
    renderOnAddRemove: false,
    hoverCursor: 'default',
    backgroundColor: '#F1F4F7',
    selectionKey: undefined,
    selection: false,
    selectionColor: 'rgba(143, 126, 244, 0.3)',
    selectionBorderColor: '#8F7EF4',
    selectionLineWidth: 2,
  };
  const canvas = new fabric.Canvas(el, options);
  canvas._shouldClearSelection = function() {
    return false;
  };

  return canvas;
}
