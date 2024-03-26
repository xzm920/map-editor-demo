import { DESC_NON_EFFECT_LAYERS, LAYER, TILE_SIZE } from '../../constants';
import { toTiledPoint } from "../../utils";
import { isRectInRect } from "../../geometry";
import { EraserView } from '../../view/eraseView';

export class ToolErase {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.mapCanvas = mapEditor.view;
    this.mapContainer = mapEditor.model;

    this.eraserSize = TILE_SIZE;
    this.eraserView = new EraserView(this.eraserSize, this.eraserSize);
    this.mapCanvas.addToolView(this.eraserView);

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
    this.mapCanvas.removeToolView(this.eraserView);
  }

  _listen() {
    let isPanning = false;

    const getEraserRect = (point) => {
      return { left: point.x, top: point.y, width: this.eraserSize, height: this.eraserSize };
    };

    const removeItemByRect = (rect) => {
      const descLayers = this.mapCanvas.showMask ? [LAYER.effect] : DESC_NON_EFFECT_LAYERS;
      const mapItem = this.mapContainer.getItemByRect(rect, descLayers);
      if (mapItem) {
        this.mapContainer.remove(mapItem);
      }
    };

    const handleMouseDown = (e) => {
      isPanning = true;  
      const point = toTiledPoint(e.absolutePointer);
      const rect = getEraserRect(point);
      removeItemByRect(rect);
    };

    // TODO: throttle ?
    const handleMouseMove = (e) => {
      const point = toTiledPoint(e.absolutePointer);
      const rect = getEraserRect(point);
      const visible = isRectInRect(rect, this.mapContainer.bbox);

      this.eraserView.setPosition(point.x, point.y);
      this.eraserView.setVisible(visible);
      this.mapCanvas.render();

      if (isPanning) {
        removeItemByRect(rect);
      }
    };

    const handleMouseUp = () => {
      isPanning = false;
    };

    this.mapCanvas.canvas.on('mouse:down', handleMouseDown);
    this.mapCanvas.canvas.on('mouse:move', handleMouseMove);
    this.mapCanvas.canvas.on('mouse:up', handleMouseUp);

    return () => {
      this.mapCanvas.canvas.off('mouse:down', handleMouseDown);
      this.mapCanvas.canvas.off('mouse:move', handleMouseMove);
      this.mapCanvas.canvas.off('mouse:up', handleMouseUp);
    };
  }
}
