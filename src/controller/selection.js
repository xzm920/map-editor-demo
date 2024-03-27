import { clamp } from "lodash";
import { LAYER, DESC_NON_EFFECT_LAYERS, TILE_SIZE, MAP_ITEM_TYPE } from "../constants";
import { getBBox, isPointInRect, isPointInRotatedRect } from "../geometry";
import { getRectOffsetToClosestTile, toIntegerPoint, toTiledPoint } from "../utils";

export class Selection {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.mapContainer = mapEditor.model;
    this.mapCanvas = mapEditor.view;
    this.items = [];
    this.bbox = null;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  get tiled() {
    return this.items.some((item) => item.tiled);
  }

  get isEmpty() {
    return this.items.length === 0;
  }

  selectByPoint(point, shiftKey = false) {
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

    const descLayers = this.mapCanvas.showMask ? [LAYER.effect] : DESC_NON_EFFECT_LAYERS;
    const mapItem = this.mapContainer.getItemByPoint(point, descLayers);
    if (!mapItem) {
      this.unselect();
      return;
    }

    if (shiftKey) {
      this._shiftSelect(mapItem);
    } else {
      this.select(mapItem);
    }
  }

  select(items) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    if (items.length === 0) return;

    this.items = items;
    this.bbox = this._getBBox();
    this.mapCanvas.select(items);
    this.mapEditor.emit('selected', { items });
  }

  unselect() {
    if (this.isEmpty) return;

    this.items = [];
    this.bbox = this._getBBox();
    this.mapCanvas.unselect();
    this.mapEditor.emit('unselected');
  }

  _shiftSelect(item) {
    const items = [...this.items];
    const index = items.indexOf(item);
    if (index === -1) {
      items.push(item);
    } else {
      items.splice(index, 1);
    }

    if (items.length === 0) {
      this.unselect();
    } else {
      this.select(items);
    }
  }

  move(movePoint, startPoint, selectedStartPos) {
    const { movementX, movementY } = this._getMovement(movePoint, startPoint);
    if (movementX === 0 && movementY === 0) return;

    const left = selectedStartPos.left + movementX;
    const top = selectedStartPos.top + movementY;
    this.mapCanvas.moveSelected(left, top);
  }

  finishMove(upPoint, startPoint) {
    const { movementX, movementY } = this._getMovement(upPoint, startPoint);
    if (movementX === 0 && movementY === 0) return;
    
    this._isBusy = true;
    this._batchMove(movementX, movementY);
    this._isBusy = false;
  }

  _batchMove(movementX, movementY) {
    this.mapEditor.startBatch();
    const items = this.items;
    const positions = items.map((v) => ({ left: v.left, top: v.top }));
    this.unselect();
    try {
      for (let item of items) {
        item.move(item.left + movementX, item.top + movementY);
      }
    } catch (err) {
      items.forEach((item, index) => {
        const { left, top } = positions[index];
        item.move(left, top);
        const itemView = this.mapCanvas.getItemView(item);
        itemView?.syncModel();
      });
      this.select(items);
      this.mapEditor.abortBatch();
      return;
    }
    this.select(items);
    this.mapEditor.stopBatch();
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
    movePoint = toIntegerPoint(movePoint);
    startPoint = toIntegerPoint(startPoint);

    if (movePoint.x === startPoint.x && movePoint.y === startPoint.y) {
      return { movementX: 0, movementY: 0 };
    }

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

    let movementX = x - this.bbox.left;
    let movementY = y - this.bbox.top;
    if (this.tiled) {
      movementX = movementX >= 0
        ? Math.floor(movementX / TILE_SIZE) * TILE_SIZE
        : Math.ceil(movementX / TILE_SIZE) * TILE_SIZE;
      movementY = movementY >= 0
      ? Math.floor(movementY / TILE_SIZE) * TILE_SIZE
      : Math.ceil(movementY / TILE_SIZE) * TILE_SIZE;
    }
    return { movementX, movementY };
  }

  _listen() {
    // TODO: 观察有没有性能问题
    const handleModelChange = (type) => {
      if (this._isBusy) return;
      if (this.isEmpty) return;

      const items = this.items.filter((item) => this.mapContainer.has(item));
      if (items.length === 1 && items[0].type === MAP_ITEM_TYPE.text) {
        const textView = this.mapCanvas.getItemView(items[0]);
        if (textView.isEditing) {
          return;
        }
      }

      if (items.length === 0) {
        this.unselect();
      } else {
        if (type === 'before:modelChange') {
          this.mapCanvas.unselect();
        } else {
          this.select(items);
        }
      }
    };
    this.mapContainer.on('*', handleModelChange);
    return () => {
      this.mapContainer.off('*', handleModelChange);
    };
  }
}
