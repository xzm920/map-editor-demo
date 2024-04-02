import { createTiled } from "../../view";
import { shallowEqual, toTiledPoint } from "../../utils";
import { isPointInRect } from "../../geometry";

export class ToolTiled {
  constructor(mapEditor, options) {
    this.mapEditor = mapEditor;
    this.material = options.material;

    this.tiledView = createTiled({
      imageURL: this.material.url,
      left: 0,
      top: 0,
      width: this.material.w,
      height: this.material.h,
    }, () => this.mapEditor.render());
    this.tiledView.set({ opacity: 0.6 });

    this.mapEditor.presenter.addToolView(this.tiledView);

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
    
    this.mapEditor.presenter.removeToolView(this.tiledView);
  }

  _addTiledView(point) {
    const rect = { left: point.x, top: point.y, width: this.tiledView.width, height: this.tiledView.height }
    this.tiledView.set(rect);
    this.mapEditor.presenter.addToolView(this.tiledView);
  }

  _updateTiledView(point) {
    this.mapEditor.presenter.updateToolView({ left: point.x, top: point.y });
  }

  _addTiled(point) {
    this.mapEditor.model.addTiled(this.material, point);
  }

  _listen() {
    let lastMoveTiled = null;

    const handleMouseDown = (e) => {
      const downPoint = e.absolutePointer;
      if (!isPointInRect(downPoint, this.mapEditor.bbox)) return;

      const downTiled = toTiledPoint(downPoint);
      this._addTiled(downTiled);
    };
    
    const handleMouseMove = (e) => {
      const movePoint = e.absolutePointer;
      const moveTiled = toTiledPoint(movePoint);
      if (lastMoveTiled && shallowEqual(moveTiled, lastMoveTiled)) return;

      this._updateTiledView(moveTiled);
      lastMoveTiled = moveTiled;
    };

    this.mapEditor.canvas.on('mouse:down', handleMouseDown);
    this.mapEditor.canvas.on('mouse:move', handleMouseMove);
    return () => {
      this.mapEditor.canvas.off('mouse:down', handleMouseDown);
      this.mapEditor.canvas.off('mouse:move', handleMouseMove);
    };
  }
}
