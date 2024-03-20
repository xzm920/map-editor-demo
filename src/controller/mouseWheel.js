import { isMac } from '../env.js';

export class MouseWheel {
  constructor(mapCanvas) {
    this.mapCanvas = mapCanvas;

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
        const zoom = this.mapCanvas.zoom;
        let newZoom = deltaY > 0 ? zoom / 1.09 : zoom * 1.09;
        newZoom = Math.max(this.mapCanvas.minZoom, newZoom);
        newZoom = Math.min(this.mapCanvas.maxZoom, newZoom);
        if (newZoom === zoom) return;

        this.mapCanvas.zoomToPoint(newZoom, x, y);
        this.mapCanvas.render();
      } else {
        // 移动
        this.mapCanvas.relativePan(-deltaX, -deltaY);
        this.mapCanvas.render();
      }
    };

    this.mapCanvas.canvas.on('mouse:wheel', handleMouseWheel);
    return () => {
      this.mapCanvas.canvas.off('mouse:wheel', handleMouseWheel);
    };
  }
}
