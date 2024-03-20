import { LAYER, NON_EFFECT_LAYERS } from "../../constants";
import { snapPointToGrid } from "../../utils";

export class ToolSelect {
  constructor(mapContainer, mapCanvas) {
    this.mapContainer = mapContainer;
    this.mapCanvas = mapCanvas;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    let selected = null;
    let startPoint = null;
    let startTiledPoint = null;

    const handleMouseDown = (e) => {
      const point = e.absolutePointer;
      const layers = this.mapCanvas.showMask ? [LAYER.effect] : NON_EFFECT_LAYERS;
      const mapItem = this.mapContainer.findMapItemByPoint(point, layers);
      if (!mapItem) {
        this.mapCanvas.canvas.discardActiveObject();
        this.mapCanvas.render();
        return;
      }

      console.log('find map item:', mapItem);
      const itemView = this.mapCanvas.getItemView(mapItem);
      this.mapCanvas.canvas.setActiveObject(itemView.object);
      this.mapCanvas.render();
      
      selected = mapItem;
      startPoint = point;
      if (selected.tiled) {
        startTiledPoint = snapPointToGrid(point);
      }
    };

    const handleMouseMove = (e) => {
      if (!selected) return;

      const point = e.absolutePointer;
      let left;
      let top;
      if (selected.tiled) {
        const tiledPoint = snapPointToGrid(point);
        left = selected.left + tiledPoint.x - startTiledPoint.x;
        top = selected.top + tiledPoint.y - startTiledPoint.y;
      } else {
        left = selected.left + point.x - startPoint.x;
        top = selected.top + point.y - startPoint.y;
      }
      
      const itemView = this.mapCanvas.getItemView(selected);
      itemView.object.set({ left, top });
      this.mapCanvas.render();
    };

    const handleMouseUp = (e) => {
      if (!selected) return;

      const point = e.absolutePointer;
      let left;
      let top;
      if (selected.tiled) {
        const tiledPoint = snapPointToGrid(point);
        left = selected.left + tiledPoint.x - startTiledPoint.x;
        top = selected.top + tiledPoint.y - startTiledPoint.y;
      } else {
        left = selected.left + point.x - startPoint.x;
        top = selected.top + point.y - startPoint.y;
      }

      try {
        selected.move(left, top);
      } catch (err) {
        // 返回原位
        selected.move(selected.left, selected.top);
      }
      selected = null;
      startPoint = null;
    };

    this.mapCanvas.canvas.on('mouse:down', handleMouseDown);
    this.mapCanvas.canvas.on('mouse:move', handleMouseMove);
    this.mapCanvas.canvas.on('mouse:up', handleMouseUp);
    return () => {
      this.mapCanvas.canvas.off('mouse:down', handleMouseDown);
      this.mapCanvas.canvas.off('mouse:move', handleMouseMove);
      this.mapCanvas.canvas.off('mouse:up', handleMouseUp);
    };
  }
}
