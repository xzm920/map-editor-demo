import { DESC_NON_EFFECT_LAYERS, LAYER, TILE_SIZE } from '../../constants';
import { toTiledPoint } from "../../utils";
import { isRectInRect } from "../../geometry";
import { createEraser } from '../../view';

export class ToolErase {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this.eraserSize = TILE_SIZE;
    this.eraser = createEraser({
      left: 0,
      top: 0,
      width: this.eraserSize,
      height: this.eraserSize,
    });
    this.mapEditor.presenter.addToolView(this.eraser);

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
    this.mapEditor.presenter.removeToolView(this.eraser);
  }

  _listen() {
    let isPanning = false;
    let lastMovePoint = null;

    const getEraserRect = (point) => {
      return { left: point.x, top: point.y, width: this.eraserSize, height: this.eraserSize };
    };

    const removeItemByRect = (rect) => {
      const descLayers = this.mapEditor.showMask ? [LAYER.effect] : DESC_NON_EFFECT_LAYERS;
      const mapItem = this.mapEditor.model.getItemByRect(rect, descLayers);
      if (mapItem) {
        this.mapEditor.model.remove(mapItem);
      }
    };

    const handleMouseDown = (e) => {
      isPanning = true;  
      const point = toTiledPoint(e.absolutePointer);
      const rect = getEraserRect(point);
      removeItemByRect(rect);
    };

    const handleMouseMove = (e) => {
      const point = toTiledPoint(e.absolutePointer);
      if (lastMovePoint && point.x === lastMovePoint.x && point.y === lastMovePoint.y) return;
      lastMovePoint = point;
      const rect = getEraserRect(point);
      if (!isRectInRect(rect, this.mapEditor.bbox)) return;

      this.mapEditor.presenter.updateToolView({
        left: point.x,
        top: point.y,
      });

      if (isPanning) {
        removeItemByRect(rect);
      }
    };

    const handleMouseUp = () => {
      isPanning = false;
      lastMovePoint = null;
    };

    this.mapEditor.canvas.on('mouse:down', handleMouseDown);
    this.mapEditor.canvas.on('mouse:move', handleMouseMove);
    this.mapEditor.canvas.on('mouse:up', handleMouseUp);

    return () => {
      this.mapEditor.canvas.off('mouse:down', handleMouseDown);
      this.mapEditor.canvas.off('mouse:move', handleMouseMove);
      this.mapEditor.canvas.off('mouse:up', handleMouseUp);
    };
  }
}
