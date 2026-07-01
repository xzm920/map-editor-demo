import { createTiled } from "../../view";
import { getTiledRectByPoints, shallowEqual, toTiledPoint } from "../../utils";
import { isPointInRect, limitRectInRect } from "../../geometry";
import { createSelection } from "../../view/selection";

export class ToolFloor {
  constructor(mapEditor, options) {
    this.mapEditor = mapEditor;
    this.material = options.material;

    this.floorView = createTiled({
      imageURL: this.material.url,
      left: 0,
      top: 0,
      width: this.material.w,
      height: this.material.h,
    }, () => this.mapEditor.render());
    this.floorView.set({ opacity: 0.6 });
    this.selectionView = createSelection();
    this.mapEditor.presenter.addToolView(this.floorView);

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
    
    const toolView = this.floorView || this.selectionView;
    this.mapEditor.presenter.removeToolView(toolView);
  }

  _addFloorView(point) {
    this.mapEditor.presenter.removeToolView(this.selectionView);
    const rect = { left: point.x, top: point.y, width: this.floorView.width, height: this.floorView.height }
    this.floorView.set(rect);
    this.mapEditor.presenter.addToolView(this.floorView);
  }

  _updateFloorView(point) {
    this.mapEditor.presenter.updateToolView({ left: point.x, top: point.y });
  }

  _addSelectionView(rect) {
    this.mapEditor.presenter.removeToolView(this.floorView);
    this.selectionView.set(rect);
    this.mapEditor.presenter.addToolView(this.selectionView);
  }

  _updateSelectionView(rect) {
    rect = limitRectInRect(rect, this.mapEditor.bbox);
    this.mapEditor.presenter.updateToolView(rect);
  }

  _addFloors(selectionRect) {
    selectionRect = limitRectInRect(selectionRect, this.mapEditor.bbox);
    this.mapEditor.startBatch();
    this.mapEditor.model.batchAddOrReplaceFloors(this.material, selectionRect);
    this.mapEditor.stopBatch();
  }

  _listen() {
    let isPanning = false;
    let downPoint = null;
    let lastMoveTiled = null;
    let lastMoveRect = null;

    const handleMouseDown = (e) => {
      downPoint = e.absolutePointer;
      if (!isPointInRect(downPoint, this.mapEditor.bbox)) return;

      const downRect = getTiledRectByPoints(downPoint, downPoint);
      this._addSelectionView(downRect);
      isPanning = true;
    };
    
    const handleMouseMove = (e) => {
      const movePoint = e.absolutePointer;

      if (isPanning) {
        let moveRect = getTiledRectByPoints(downPoint, movePoint);
        if (lastMoveRect && shallowEqual(moveRect, lastMoveRect)) return;
        
        this._updateSelectionView(moveRect);
        lastMoveRect = moveRect;
      } else {
        const moveTiled = toTiledPoint(movePoint);
        if (lastMoveTiled && shallowEqual(moveTiled, lastMoveTiled)) return;

        this._updateFloorView(moveTiled);
        lastMoveTiled = moveTiled;
      }
    };
    
    const handleMouseUp = (e) => {
      const upPoint = e.absolutePointer;

      if (isPanning) {
        const upTiled = toTiledPoint(upPoint);
        this._addFloorView(upTiled);

        const selectionRect = getTiledRectByPoints(downPoint, upPoint);
        this._addFloors(selectionRect);
      }

      isPanning = false;
      downPoint = null;
      lastMoveRect = null;
      lastMoveTiled = null;
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
