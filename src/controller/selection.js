import { clamp } from "lodash";
import { LAYER, NON_EFFECT_LAYERS } from "../constants";
import { getBBox, isPointInRect, isPointInRotatedRect } from "../geometry";
import { getRectOffsetToClosestTile, toTiledPoint } from "../utils";

export class Selection {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.mapContainer = mapEditor.model;
    this.mapCanvas = mapEditor.view;
    this.items = [];
    this.bbox = null;
  }

  get tiled() {
    return this.items.some((item) => item.tiled);
  }

  get isEmpty() {
    return this.items.length === 0;
  }

  // FIXME: shiftkey 多选
  selectByPoint(point, shiftKey) {
    if (!shiftKey) {
      let clickSelected = false;
      if (this.items.length === 1) {
        const mapItem = this.items[0];
        clickSelected = isPointInRotatedRect(point, mapItem, mapItem.rect);
      } else if (this.items.length > 1) {
        clickSelected = isPointInRect(point, this.bbox);
      }
      if (clickSelected) return;
    }

    const layers = this.mapCanvas.showMask ? [LAYER.effect] : NON_EFFECT_LAYERS;
    const mapItem = this.mapContainer.getItemByPoint(point, layers);
    if (!mapItem) {
      this.unselect();
      return;
    }

    if (shiftKey) {
      this._shiftSelect(mapItem);
    } else {
      this.select([mapItem]);
    }
  }

  select(items) {
    this.items = items;
    this.bbox = this._getBBox();

    this.mapCanvas.select(this.items);
    this.mapEditor.emit('selected', { items: this.items });
  }

  _shiftSelect(item) {
    const index = this.items.indexOf(item);
    if (index === -1) {
      if (this.items.length === 0) {
        this.items = [item];
        this.mapCanvas.select(this.items);
      } else {
        this.items.push(item);
        this.mapCanvas.addToSelection(item);
      }
    } else {
      if (this.items.length === 1) {
        this.items = [];
        this.mapCanvas.unselect();
      } else {
        this.items.splice(index, 1);
        this.mapCanvas.removeFromSelection(item);
      }
    }
    this.bbox = this._getBBox();

    if (this.items.length > 0) {
      this.mapEditor.emit('selected', { items: this.items });
    } else {
      this.mapEditor.emit('unselected');
    }
  }

  unselect() {
    this.items = [];
    this.bbox = this._getBBox();

    this.mapCanvas.unselect();
    this.mapEditor.emit('unselected');
  }

  move(movePoint, startPoint, selectedStartPos) {
    const { movementX, movementY } = this._getMovement(movePoint, startPoint);

    // TODO:
    const activeObject = this.mapCanvas.canvas.getActiveObject();
    activeObject.set({
      left: selectedStartPos.left + movementX,
      top: selectedStartPos.top + movementY,
    });
    this.mapCanvas.canvas.requestRenderAll();
  }

  finishMove(upPoint, startPoint) {
    const { movementX, movementY } = this._getMovement(upPoint, startPoint);

    this.mapCanvas.unselect();
    this.items.forEach((item) => {
      item.move(item.left + movementX, item.top + movementY);
    });
    this.bbox = this._getBBox();
    this.mapCanvas.select(this.items);
  }

  _getBBox() {
    if (this.items.length === 0) return null;

    const bboxs = this.items.map((item) => getBBox(item, item.angle));
    const leftVals = bboxs.map((v) => v.left);
    const rightVals = bboxs.map((v) => v.left + v.width);
    const topVals = bboxs.map((v) => v.top);
    const bottomVals = bboxs.map((v) => v.top + v.height);
    const left = Math.min(...leftVals);
    const top = Math.min(...topVals);
    const width = Math.max(...rightVals) - left;
    const height = Math.max(...bottomVals) - top;
    return { left, top, width, height };
  }

  _getMovement(movePoint, startPoint) {
    if (this.tiled) {
      startPoint = toTiledPoint(startPoint);
      movePoint = toTiledPoint(movePoint);
    }
    let x = this.bbox.left + movePoint.x - startPoint.x;
    let y = this.bbox.top + movePoint.y - startPoint.y;
    
    if (!this.tiled && this.mapCanvas.alignTile) {
      const movingRect = { left: x, top: y, width: this.bbox.width, height: this.bbox.height };
      const threshold = this.mapCanvas.alignThreshold / this.mapCanvas.zoom;
      const { offsetX, offsetY } = getRectOffsetToClosestTile(movingRect, threshold);
      x += offsetX;
      y += offsetY;
    }

    const mapBound = this.mapEditor.model.getBoundingRect();
    x = clamp(x, mapBound.left, mapBound.left + mapBound.width - this.bbox.width);
    y = clamp(y, mapBound.top, mapBound.top + mapBound.height - this.bbox.height);
    return {
      movementX: x - this.bbox.left,
      movementY: y - this.bbox.top,
    };
  }
}
