import { fabric } from "fabric";
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
    this.selection.unselect();
  }

  _listen() {
    let isPanning = false;
    let startPoint = null;
    let selectedStartPos = null;

    const handleMouseDown = (e) => {
      if (e.transform && e.transform.action !== 'drag') return;
      
      if (e.target instanceof fabric.IText && e.target.isEditing) return;

      startPoint = e.absolutePointer;
      this.selection.selectByPoint(startPoint, e.e.shiftKey);

      if (this.selection.isEmpty || e.e.shiftKey) return;

      isPanning = true;
      const activeObject = this.mapCanvas.canvas.getActiveObject();
      selectedStartPos = { left: activeObject.left, top: activeObject.top };
    };

    const handleMouseMove = (e) => {
      if (!isPanning) return;

      const movePoint = e.absolutePointer;
      this.selection.move(movePoint, startPoint, selectedStartPos);
      // 保证移动选中的文字松开后，文字不会进入编辑状态。见 https://github.com/fabricjs/fabric.js/blob/4c305baae69fd998e783195fd23453fd05187e5a/src/mixins/itext_click_behavior.mixin.js#L156
      if (e.transform) {
        e.transform.actionPerformed = true;
      }
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
      }
    };
    
    const handleObjectScaling = () => {
      // TODO: 
    };

    const handleObjectRotating = () => {
      // TODO:
    };

    const handleObjectResizing = () => {
      // TODO:
    }

    let isNewText = false;

    const handleTextEditingEntered = (e) => {
      const textObject = e.target;
      const textView = this.mapCanvas.getViewByObject(textObject);
      const text = textView.model;
      isNewText = text.text === '';
      this.mapEditor.startBatch();
    };

    const handleTextChanged = (e) => {
      const textObject = e.target;
      const textView = this.mapCanvas.getViewByObject(textObject);
      const text = textView.model;
      text.setText(textObject.text, textObject.height);
    };

    const handleTextEditingExited = (e) => {
      const textObject = e.target;
      const textView = this.mapCanvas.getViewByObject(textObject);
      const text = textView.model;
      if (textObject.text === '') {
        // 等待完全退出编辑状态，再删除文字
        setTimeout(() => {
          this.mapContainer.remove(text);
          if (isNewText) {
            this.mapEditor.abortBatch();
          } else {
            this.mapEditor.stopBatch();
          }
        }, 0);
      } else {
        this.mapEditor.stopBatch();
      }
    };

    const handleContextMenu = (e) => {
      const point = this.mapCanvas.canvas.getPointer(e);
      this.selection.selectByPoint(point);
      const { items } = this.selection;
      if (items.length === 1) {
        this.mapEditor.emit('contextMenu', {
          mapItem: items[0],
          position: { left: e.pageX, top: e.pageY },
        });
      } else if (items.length > 0) {
        // TODO: 选中多个元素时的上下文菜单
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
    this.mapCanvas.canvas.on('text:editing:entered', handleTextEditingEntered);
    this.mapCanvas.canvas.on('text:editing:exited', handleTextEditingExited);
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
      this.mapCanvas.canvas.off('text:editing:exited', handleTextEditingExited);
      this.mapCanvas.canvas.on('text:editing:entered', handleTextEditingEntered);
      this.mapCanvas.canvas.upperCanvasEl.removeEventListener('contextmenu', handleContextMenu);
    };
  }
}
