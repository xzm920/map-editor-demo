import { fabric } from "fabric";
import { SELECTION } from "../../constants";
import { toTiledCoord } from "../../utils";
import { EVENT } from "../../event";

export class ToolSelect {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
    this.mapEditor.selection.clear();
  }

  _listen() {
    let isPanning = false;
    let startPoint = null;
    let startPos = null;
    let didMove = false;
    let downOnSelection = false;
    let downItem = null;

    const handleMouseDown = (e) => {
      if (e.transform && e.transform.action !== 'drag') return;
      
      // TODO:
      if (e.target instanceof fabric.IText && e.target.isEditing) return;

      didMove = false;

      const { shiftKey } = e.e;
      const { selection } = this.mapEditor;
      startPoint = e.absolutePointer;

      downOnSelection = selection.containsPoint(startPoint);
      downItem = this.mapEditor.getItemByPoint(startPoint);
      const downOnSelected = this.mapEditor.selection.isSelected(downItem);
      
      if (shiftKey && downItem) {
        if (downOnSelected) {
          selection.unselect(downItem);
        } else {
          selection.select(downItem);
        }
      } else if (!downOnSelection) {
        if (downItem) {
          selection.reset(downItem);
        } else {
          selection.clear();
        }
      }

      if (selection.status !== SELECTION.none) {
        isPanning = true;
        startPos = { x: selection.bbox.left, y: selection.bbox.top };
      }
    };

    const handleMouseMove = (e) => {
      if (!isPanning) return;
      
      const { selection } = this.mapEditor;
      const movePoint = e.absolutePointer;
      didMove = true;

      let left;
      let top;
      if (selection.isTiled()) {
        left = startPos.x + toTiledCoord(movePoint.x) - toTiledCoord(startPoint.x);
        top = startPos.y + toTiledCoord(movePoint.y) - toTiledCoord(startPoint.y);
      } else {
        left = startPos.x + movePoint.x - startPoint.x;
        top = startPos.y + movePoint.y - startPoint.y;
      }
      selection.move(left, top);

      // 保证移动选中的文字松开后，文字不会进入编辑状态。见 https://github.com/fabricjs/fabric.js/blob/4c305baae69fd998e783195fd23453fd05187e5a/src/mixins/itext_click_behavior.mixin.js#L156
      if (e.transform) {
        e.transform.actionPerformed = true;
      }
    };

    const handleMouseUp = (e) => {
      if (!isPanning) return;

      const { shiftKey } = e.e;
      const { selection } = this.mapEditor;
      if (didMove) {
        const upPoint = e.absolutePointer;
        let left;
        let top;
        if (selection.isTiled()) {
          left = startPos.x + toTiledCoord(upPoint.x) - toTiledCoord(startPoint.x);
          top = startPos.y + toTiledCoord(upPoint.y) - toTiledCoord(startPoint.y);
        } else {
          left = startPos.x + upPoint.x - startPoint.x;
          top = startPos.y + upPoint.y - startPoint.y;
        }
        selection.finishMove(left, top);
      } else if (!shiftKey) {
        if (downItem) {
          selection.reset(downItem);
        } else {
          selection.clear();
        }
      }

      isPanning = false;
      startPoint = null;
      startPos = null;
    };

    const handleContextMenu = (e) => {
      const { selection, canvas } = this.mapEditor;
      const point = canvas.getPointer(e);
      const downItem = this.mapEditor.getItemByPoint(point);
      let downOnSelected = selection.isSelected(downItem);
      if (!downOnSelected) {
        if (downItem) {
          selection.reset(downItem);
          downOnSelected = true;
        }
      }

      if (downOnSelected && selection.status === SELECTION.single) {
        this.mapEditor.emit(EVENT.contextMenu, {
          mapItem: selection.items[0],
          position: { left: e.pageX, top: e.pageY },
        });
      }
    };

    this.mapEditor.canvas.on('mouse:down', handleMouseDown);
    this.mapEditor.canvas.on('mouse:move', handleMouseMove);
    this.mapEditor.canvas.on('mouse:up', handleMouseUp);
    this.mapEditor.canvas.upperCanvasEl.addEventListener('contextmenu', handleContextMenu);

    return () => {
      this.mapEditor.canvas.off('mouse:down', handleMouseDown);
      this.mapEditor.canvas.off('mouse:move', handleMouseMove);
      this.mapEditor.canvas.off('mouse:up', handleMouseUp);
      this.mapEditor.canvas.upperCanvasEl.removeEventListener('contextmenu', handleContextMenu);
    };
  }
}
