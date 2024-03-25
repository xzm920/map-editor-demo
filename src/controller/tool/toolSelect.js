import { getBBox, isRectInRect } from "../../geometry";

export class ToolSelect {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.mapContainer = mapEditor.model;
    this.mapCanvas = mapEditor.view;
    this.selection = mapEditor.selection;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    let isPanning = false;
    let startPoint = null;
    let selectedStartPos = null;

    const handleMouseDown = (e) => {
      if (e.transform && e.transform.action !== 'drag') {
        return;
      }

      startPoint = e.absolutePointer;
      this.selection.selectByPoint(startPoint, e.e.shiftKey);

      if (this.selection.isEmpty || e.e.shiftKey) {
        return;
      }

      isPanning = true;
      const activeObject = this.mapCanvas.canvas.getActiveObject();
      selectedStartPos = { left: activeObject.left, top: activeObject.top };
    };

    const handleMouseMove = (e) => {
      if (!isPanning) return;

      const movePoint = e.absolutePointer;
      this.selection.move(movePoint, startPoint, selectedStartPos);
    };

    const handleMouseUp = (e) => {
      if (!isPanning) return;
      isPanning = false;

      const upPoint = e.absolutePointer;
      this.selection.finishMove(upPoint, startPoint);
      startPoint = null;
    };

    const handleObjectModified = (e) => {
      const { action, target } = e;

      const itemView = this.mapCanvas.getViewByObject(target);
      if (!itemView) return;
      const mapItem = itemView.model;
      if (!mapItem) return;

      const mapBound = this.mapContainer.getBoundingRect();
      const bound = getBBox({left: target.left, top: target.top, width: target.width, height: target.height}, target.angle);
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

    const handleContextMenu = (e) => {
      const point = this.mapCanvas.canvas.getPointer(e);
      const mapItem = this.mapContainer.getItemByPoint(point);
      if (mapItem) {
        this.mapEditor.select(mapItem);
        this.mapEditor.emit('contextMenu', {
          mapItem,
          position: { left: e.pageX, top: e.pageY },
        });
      }
    };

    this.mapCanvas.canvas.on('mouse:down', handleMouseDown);
    this.mapCanvas.canvas.on('mouse:move', handleMouseMove);
    this.mapCanvas.canvas.on('mouse:up', handleMouseUp);
    this.mapCanvas.canvas.on('object:modified', handleObjectModified);
    this.mapCanvas.canvas.on('object:scaling', handleObjectScaling);
    this.mapCanvas.canvas.on('object:rotating', handleObjectRotating);
    this.mapCanvas.canvas.on('object:resizing', handleObjectResizing);
    this.mapCanvas.canvas.on('text:changed', handleTextChanged);
    this.mapCanvas.canvas.upperCanvasEl.addEventListener('contextmenu', handleContextMenu);

    return () => {
      this.mapCanvas.canvas.off('mouse:down', handleMouseDown);
      this.mapCanvas.canvas.off('mouse:move', handleMouseMove);
      this.mapCanvas.canvas.off('mouse:up', handleMouseUp);
      this.mapCanvas.canvas.off('object:modified', handleObjectModified);
      this.mapCanvas.canvas.off('object:scaling', handleObjectScaling);
      this.mapCanvas.canvas.on('object:rotating', handleObjectRotating);
      this.mapCanvas.canvas.off('object:resizing', handleObjectResizing);
      this.mapCanvas.canvas.off('text:changed', handleTextChanged);
      this.mapCanvas.canvas.upperCanvasEl.removeEventListener('contextmenu', handleContextMenu);
    };
  }
}
