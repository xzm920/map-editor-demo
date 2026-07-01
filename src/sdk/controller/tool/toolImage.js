import { createTiled } from "../../view";
import { isRectInRect } from "../../geometry";

export class ToolImage {
  constructor(mapEditor, options) {
    this.mapEditor = mapEditor;
    this.material = options.material;

    this.imageView = createTiled({
      imageURL: this.material.url,
      left: 0,
      top: 0,
      width: this.material.w,
      height: this.material.h,
    }, () => this.mapEditor.render());
    this.imageView.set({ opacity: 0.6 });

    this.mapEditor.presenter.addToolView(this.imageView);

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
    
    this.mapEditor.presenter.removeToolView(this.imageView);
  }

  _addImageView(point) {
    const rect = { left: point.x, top: point.y, width: this.imageView.width, height: this.imageView.height }
    this.imageView.set(rect);
    this.mapEditor.presenter.addToolView(this.imageView);
  }

  _updateImageView(point) {
    this.mapEditor.presenter.updateToolView({ left: point.x, top: point.y });
  }

  _addImage(point) {
    const viewRect = {
      left: point.x,
      top: point.y,
      width: this.imageView.width,
      height: this.imageView.height,
    }
    if (!isRectInRect(viewRect, this.mapEditor.bbox)) return;

    this.mapEditor.model.addImage(this.material, point);
  }

  _listen() {
    const handleMouseDown = (e) => {
      const downPoint = e.absolutePointer;
      this._addImage(downPoint);
    };
    
    const handleMouseMove = (e) => {
      const movePoint = e.absolutePointer;
      this._updateImageView(movePoint);
    };

    this.mapEditor.canvas.on('mouse:down', handleMouseDown);
    this.mapEditor.canvas.on('mouse:move', handleMouseMove);
    return () => {
      this.mapEditor.canvas.off('mouse:down', handleMouseDown);
      this.mapEditor.canvas.off('mouse:move', handleMouseMove);
    };
  }
}
