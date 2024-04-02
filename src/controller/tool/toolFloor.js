import { createTiled } from "../../view";
import { getTiledRectByPoints, shallowEqual, toTiledPoint } from "../../utils";
import { isPointInRect, limitRectInRect } from "../../geometry";
import { createSelection } from "../../view/selection";
import { LAYER } from "../../constants";

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
    this.mapEditor.presenter.removeToolView(this.floorView);
    this._unlisten();
  }

  _listen() {
    let isPanning = false;
    let startPoint = null;
    let lastMoveTiled = null;
    let lastMoveRect = null;

    const getFloorRect = (point) => {
      const { width, height } = this.floorView;
      return { left: point.x, top: point.y, width, height };
    };

    const handleMouseDown = (e) => {
      startPoint = e.absolutePointer;
      if (!isPointInRect(startPoint, this.mapEditor.bbox)) return;

      this.mapEditor.presenter.removeToolView(this.floorView);
      const rect = getTiledRectByPoints(startPoint, startPoint);
      this.selectionView.set(rect);

      this.mapEditor.presenter.addToolView(this.selectionView);

      isPanning = true;
    };
    
    const handleMouseMove = (e) => {
      const movePoint = e.absolutePointer;

      if (isPanning) {
        let moveRect = getTiledRectByPoints(startPoint, movePoint);
        if (lastMoveRect && shallowEqual(moveRect, lastMoveRect)) return;
        
        moveRect = limitRectInRect(moveRect, this.mapEditor.bbox);
        this.mapEditor.presenter.updateToolView(moveRect);
        lastMoveRect = moveRect;
      } else {
        const moveTiled = toTiledPoint(movePoint);
        if (lastMoveTiled && shallowEqual(moveTiled, lastMoveTiled)) return;

        this.mapEditor.presenter.updateToolView({
          left: moveTiled.x,
          top: moveTiled.y,
        });
        lastMoveTiled = moveTiled;
      }
    };
    
    const handleMouseUp = (e) => {
      const upPoint = e.absolutePointer;

      if (isPanning) {
        this.mapEditor.presenter.removeToolView(this.selectionView);
        const upTiled = toTiledPoint(upPoint);
        const floorRect = getFloorRect(upTiled);
        this.floorView.set(floorRect);
        this.mapEditor.presenter.addToolView(this.floorView);

        let rect = getTiledRectByPoints(startPoint, upPoint);
        rect = limitRectInRect(rect, this.mapEditor.bbox);
        const floorLayer = this.mapEditor.model.getLayer(LAYER.floor);
        this.mapEditor.startBatch();
        floorLayer.batchAddOrReplace(this.material, rect);
        this.mapEditor.stopBatch();
      }

      isPanning = false;
      startPoint = null;
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
