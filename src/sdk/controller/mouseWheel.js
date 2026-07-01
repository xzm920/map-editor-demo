import { isMac } from '../env.js';

export class MouseWheel {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const handleMouseWheel = (e) => {
      // 防止过度滚动导致浏览器回弹，防止缩放导致浏览器页面缩放
      e.e.preventDefault();
      const { x, y } = e.pointer;
      const { ctrlKey, shiftKey, metaKey } = e.e;
      let { deltaX, deltaY } = e.e;
      const ctrlAndCommandKey = ctrlKey || (isMac ? metaKey : false);

      // mac按住shift键滑动鼠标滚轮的时候，会自动转换成横向；其他平台需要手动转换
      if (!isMac && shiftKey) {
        const temp = deltaX;
        deltaX = deltaY;
        deltaY = temp;
      }

      if (ctrlAndCommandKey) {
        if (deltaY === 0) return;
        // 缩放
        const zoom = this.mapEditor.zoom;
        let newZoom = deltaY > 0 ? zoom / 1.09 : zoom * 1.09;
        this.mapEditor.zoomToPoint(newZoom, x, y);
      } else {
        // 移动
        this.mapEditor.relativePan(-deltaX, -deltaY);
      }
    };

    this.mapEditor.canvas.on('mouse:wheel', handleMouseWheel);
    return () => {
      this.mapEditor.canvas.off('mouse:wheel', handleMouseWheel);
    };
  }
}
