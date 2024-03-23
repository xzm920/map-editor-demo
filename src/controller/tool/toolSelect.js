import { clamp } from "lodash";
import { LAYER, NON_EFFECT_LAYERS } from "../../constants";
import { getRectOffsetToClosedTile, toTiledPoint } from "../../utils";
import { isRectInRect } from "../../geometry";

export class ToolSelect {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.mapContainer = mapEditor.model;
    this.mapCanvas = mapEditor.view;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    let isPanning = false;
    let startPoint = null;
    let moveRange = null;
    let bound = null;

    const getMoveRange = (mapItem) => {
      const mapBound = this.mapContainer.getBoundingRect();
      const deltaX = mapItem.left - bound.left;
      const deltaY = mapItem.top - bound.top;
      return {
        minX: 0 + deltaX,
        maxX: mapBound.width - bound.width + deltaX,
        minY: 0 + deltaY,
        maxY: mapBound.height - bound.height + deltaY,
      };
    };

    const getMoveResult = (mapItem, movePoint) => {
      movePoint = mapItem.tiled ? toTiledPoint(movePoint) : movePoint;
      const moveX = movePoint.x - startPoint.x;
      const moveY = movePoint.y - startPoint.y;
      let x = mapItem.left + moveX;
      let y = mapItem.top + moveY;

      if (this.mapCanvas.alignTile && !mapItem.tiled) {
        const moveBound = { ...bound, left: bound.left + moveX, top: bound.top + moveY };
        const threshold = this.mapCanvas.alignThreshold / this.mapCanvas.zoom;
        const { offsetX, offsetY } = getRectOffsetToClosedTile(moveBound, threshold);
        x += offsetX;
        y += offsetY;
      }

      x = clamp(x, moveRange.minX, moveRange.maxX);
      y = clamp(y, moveRange.minY, moveRange.maxY);
      return { left: x, top: y};
    };

    const handleMouseDown = (e) => {
      if (e.transform && e.transform.action !== 'drag') {
        return;
      }

      const point = e.absolutePointer;
      const layers = this.mapCanvas.showMask ? [LAYER.effect] : NON_EFFECT_LAYERS;
      const mapItem = this.mapContainer.findMapItemByPoint(point, layers);

      if (!mapItem) {
        this.mapEditor.unselect();
        return;
      }

      isPanning = true;
      this.mapEditor.select(mapItem);
      startPoint = this.mapEditor.selected.tiled ? toTiledPoint(point) : point;
      bound = mapItem.getBoundingRect();
      moveRange = getMoveRange(this.mapEditor.selected);
    };

    const handleMouseMove = (e) => {
      if (!isPanning) return;

      const { left, top } = getMoveResult(this.mapEditor.selected, e.absolutePointer);
      const itemView = this.mapCanvas.getItemView(this.mapEditor.selected);
      itemView.object.set({ left, top });
      this.mapCanvas.render();
    };

    const handleMouseUp = (e) => {
      if (!isPanning) return;
      isPanning = false;

      const { left, top } = getMoveResult(this.mapEditor.selected, e.absolutePointer);
      try {
        this.mapEditor.selected.move(left, top);
      } catch (err) {
        const itemView = this.mapCanvas.getItemView(this.mapEditor.selected);
        itemView.render();
      }
      startPoint = null;
      moveRange = null;
      bound = null;
    };

    const handleObjectModified = (e) => {
      const { action, target } = e;
      console.log(e)

      const itemView = this.mapCanvas.getViewByObject(target);
      if (!itemView) return;
      const mapItem = itemView.model;
      if (!mapItem) return;

      const mapBound = this.mapContainer.getBoundingRect();
      const bound = target.getBoundingRect(true);
      if (!isRectInRect(bound, mapBound)) {
        itemView.render();
        return;
      }

      if (action === 'scale' || action === 'scaleX' || action === 'scaleY') {
        if (target.lockScalingFlip) {
          mapItem.scale(target.left, target.top, target.width * target.scaleX, target.height * target.scaleY);
        } else {
          mapItem.scaleFlip(target.left, target.top, target.width * target.scaleX, target.height * target.scaleY, target.flipX, target.flipY);
        }
      } else if (action === 'rotate') {
        mapItem.rotate(target.angle, target.left, target.top);
      } else if (action === 'resizing') {
        mapItem.resize(target.left, target.top, target.width, target.height);
      } else if (target.type === 'textbox') {
        mapItem.setText(target.text, target.height);
      }
    };
    
    const handleObjectScaling = (e) => {
      // TODO: 
    };

    const handleObjectRotating = (e) => {
      // TODO:
    };

    const handleObjectResizing = (e) => {
      // TODO:
    }

    const handleTextChanged = (e) => {
      // TODO:
    };

    this.mapCanvas.canvas.on('mouse:down', handleMouseDown);
    this.mapCanvas.canvas.on('mouse:move', handleMouseMove);
    this.mapCanvas.canvas.on('mouse:up', handleMouseUp);
    this.mapCanvas.canvas.on('object:modified', handleObjectModified);
    this.mapCanvas.canvas.on('object:scaling', handleObjectScaling);
    this.mapCanvas.canvas.on('object:rotating', handleObjectRotating);
    this.mapCanvas.canvas.on('object:resizing', handleObjectResizing);
    this.mapCanvas.canvas.on('text:changed', handleTextChanged);
    return () => {
      this.mapCanvas.canvas.off('mouse:down', handleMouseDown);
      this.mapCanvas.canvas.off('mouse:move', handleMouseMove);
      this.mapCanvas.canvas.off('mouse:up', handleMouseUp);
      this.mapCanvas.canvas.off('object:modified', handleObjectModified);
      this.mapCanvas.canvas.off('object:scaling', handleObjectScaling);
      this.mapCanvas.canvas.on('object:rotating', handleObjectRotating);
      this.mapCanvas.canvas.off('object:resizing', handleObjectResizing);
      this.mapCanvas.canvas.off('text:changed', handleTextChanged);
    };
  }
}
