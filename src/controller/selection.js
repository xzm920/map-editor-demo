import { clamp } from "lodash";
import { SELECTION, TILE_SIZE } from "../constants";
import { EVENT } from "../event";
import { getBBox, isPointInRect, isPointInRotatedRect } from "../geometry";
import { getRectOffsetToClosestTile, toFixed } from "../utils";

export class Selection {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this.items = [];
    this.bbox = null;
    this.itemOffsetMap = new Map();

    this._unlisten = this._listen();
  }

  get status() {
    const { length } = this.items;
    if (length === 1) return SELECTION.single;
    if (length > 1) return SELECTION.multiple;
    return SELECTION.none;
  }

  dispose() {
    this._unlisten();
  }

  isTiled() {
    for (let item of this.items) {
      if (item.isTiled()) return true;
    }
    return false;
  }

  containsPoint(point) {
    if (this.status === SELECTION.single) {
      const item = this.items[0];
      return isPointInRotatedRect(point, item, item.angle);
    } else if (this.status === SELECTION.multiple) {
      return isPointInRect(point, this.bbox);
    } else {
      return false;
    }
  }

  isSelected(item) {
    return this.items.includes(item);
  }

  select(itemOrItems) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    
    const selectedItems = this.items.map((v) => v.item);
    for (let item of items) {
      if (!selectedItems.includes(item)) {
        this.items.push(item);
      }
    }
    this._updateSelection();

    this.mapEditor.emit(EVENT.selectionChange, { items: this.items });
  }

  unselect(itemOrItems) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    for (let item of items) {
      if (this.items.includes(item)) {
        const index = this.items.indexOf(item);
        this.items.splice(index, 1);
      }
    }
    this._updateSelection();

    this.mapEditor.emit(EVENT.selectionChange, { items: this.items });
  }

  reset(itemOrItems) {
    this.items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    this._updateSelection();

    this.mapEditor.emit(EVENT.selectionChange, { items: this.items });
  }

  clear() {
    if (this.status === SELECTION.none) return;
    
    this.items = [];
    this._updateSelection();

    this.mapEditor.emit(EVENT.selectionChange, { items: this.items });
  }

  move(left, top) {
    [left, top] = this._transformPos(left, top);
    const movingBbox = { ...this.bbox, left, top };
    this.mapEditor.emit(EVENT.selectionMove, { pos: this._getViewPos(movingBbox) });
  }

  finishMove(left, top) {
    [left, top] = this._transformPos(left, top);

    this.mapEditor.startBatch();
    this._isBusy = true;
    try {
      for (let item of this.items) {
        const { offsetX, offsetY } = this.itemOffsetMap.get(item);
        const itemLeft = toFixed(left + offsetX);
        const itemTop = toFixed(top + offsetY);
        item.move(itemLeft, itemTop);
      }
    } catch (err) {
      this._isBusy = false;
      this.mapEditor.abortBatch();
      this.move(this.bbox.left, this.bbox.top);
      return;
    }
    this._isBusy = false;
    this.mapEditor.stopBatch();

    this._updateSelection();
  }

  _getViewPos(bbox) {
    if (this.status === SELECTION.single) {
      const { offsetX, offsetY } = this.itemOffsetMap.get(this.items[0]);
      return { x: bbox.left + offsetX, y: bbox.top + offsetY };
    }
    if (this.status === SELECTION.multiple) {
      return { x: bbox.left, y: bbox.top };
    }
    return null;
  }

  _transformPos(left, top) {
    const tiled = this.isTiled();
    const { alignTile, alignThreshold, zoom } = this.mapEditor;

    if (!tiled && alignTile) {
      const movingBbox = { left, top, width: this.bbox.width, height: this.bbox.height };
      const threshold = alignThreshold / zoom;
      const { offsetX, offsetY } = getRectOffsetToClosestTile(movingBbox, threshold);
      left += offsetX;
      top += offsetY;
    }

    const mapBound = this.mapEditor.model.bbox;
    left = clamp(left, mapBound.left, mapBound.left + mapBound.width - this.bbox.width);
    top = clamp(top, mapBound.top, mapBound.top + mapBound.height - this.bbox.height);
    
    if (tiled) {
      let movementX = left - this.bbox.left;
      let movementY = top - this.bbox.top;
      movementX = movementX >= 0
        ? Math.floor(movementX / TILE_SIZE) * TILE_SIZE
        : Math.ceil(movementX / TILE_SIZE) * TILE_SIZE;
      movementY = movementY >= 0
      ? Math.floor(movementY / TILE_SIZE) * TILE_SIZE
      : Math.ceil(movementY / TILE_SIZE) * TILE_SIZE;
      left = this.bbox.left + movementX;
      top = this.bbox.top + movementY;
    }

    return [left, top];
  }

  _updateSelection() {
    this.bbox = this._calcBBox();
    this.itemOffsetMap.clear();
    for (let item of this.items) {
      this.itemOffsetMap.set(item, {
        offsetX: item.left - this.bbox.left,
        offsetY: item.top - this.bbox.top,
      });
    }
  }

  _calcBBox() {
    if (this.status === SELECTION.none) return null;

    const bboxs = this.items.map((item) => getBBox(item, item.angle));
    const leftVals = bboxs.map((v) => v.left);
    const rightVals = bboxs.map((v) => v.left + v.width);
    const topVals = bboxs.map((v) => v.top);
    const bottomVals = bboxs.map((v) => v.top + v.height);
    const left = Math.min(...leftVals);
    const top = Math.min(...topVals);
    const right = Math.max(...rightVals);
    const bottom = Math.max(...bottomVals);
    return {
      left: toFixed(left),
      top: toFixed(top),
      width: toFixed(right) - toFixed(left),
      height: toFixed(bottom) - toFixed(top),
    };
  }

  _listen() {
    const handleRemove = ({ item }) => {
      if (this.isSelected(item)) {
        this.items = this.items.filter((v) => v !== item);
        if (!this._isScheduled) {
          this._isScheduled = true;
          Promise.resolve().then(() => {
            this._isScheduled = false;
            this.reset(this.items);
          });
        }
      }
    };

    const handleUpdate = ({ item }) => {
      if (this._isBusy) return;
      // FIXME:
      if (this.mapEditor.isEditing) return;

      if (this.isSelected(item)) {
        if (!this._isScheduled) {
          this._isScheduled = true;
          Promise.resolve().then(() => {
            this._isScheduled = false;
            this.reset(this.items);
          });
        }
      }
    };

    this.mapEditor.model.on('remove', handleRemove);
    this.mapEditor.model.on('update', handleUpdate);
    return () => {
      this.mapEditor.model.off('remove', handleRemove);
      this.mapEditor.model.off('update', handleUpdate);
    };
  }
}
