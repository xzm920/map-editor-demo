import { createTiled } from "../../view";
import { shallowEqual, toTiledPoint } from "../../utils";
import { isPointInRect } from "../../geometry";

export class ToolWall {
  constructor(mapEditor, options) {
    this.mapEditor = mapEditor;
    this.material = options.material;

    this.wallView = createTiled({
      imageURL: this.material.url,
      left: 0,
      top: 0,
      width: this.material.w,
      height: this.material.h,
    }, () => this.mapEditor.render());
    this.wallView.set({ opacity: 0.6 });

    this.mapEditor.presenter.addToolView(this.wallView);

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
    
    this.mapEditor.presenter.removeToolView(this.wallView);
  }

  _addWallView(point) {
    const rect = { left: point.x, top: point.y, width: this.wallView.width, height: this.wallView.height }
    this.wallView.set(rect);
    this.mapEditor.presenter.addToolView(this.wallView);
  }

  _updateWallView(point) {
    this.mapEditor.presenter.updateToolView({ left: point.x, top: point.y });
  }

  _addWall(point) {
    this.mapEditor.startBatch();
    this.mapEditor.model.addOrReplaceWall(this.material, point);
    this.mapEditor.stopBatch();
  }

  _listen() {
    let isPanning = false;
    let lastTiled = null;

    const handleMouseDown = (e) => {
      const downPoint = e.absolutePointer;
      if (!isPointInRect(downPoint, this.mapEditor.bbox)) return;

      const downTiled = toTiledPoint(downPoint);
      this._addWall(downTiled);
      isPanning = true;
      lastTiled = downTiled;
    };
    
    const handleMouseMove = (e) => {
      const movePoint = e.absolutePointer;
      const moveTiled = toTiledPoint(movePoint);
      if (lastTiled && shallowEqual(moveTiled, lastTiled)) return;

      this._updateWallView(moveTiled);
      if (isPanning && isPointInRect(movePoint, this.mapEditor.bbox)) {
        this._addWall(moveTiled);
      }
      lastTiled = moveTiled;
    };
    
    const handleMouseUp = () => {
      isPanning = false;
      lastTiled = null;
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
