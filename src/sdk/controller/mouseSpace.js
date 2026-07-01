export class MouseSpace {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const { canvas } = this.mapEditor;
    let isPanning = false;
    let isSpaceDown = false;

    const handleMouseDown = (e) => {
      isPanning = true;
    };

    const handleMouseMove = (e) => {
      if (!isPanning) return;
      if (!isSpaceDown) return;

      // TODO: 需要改造view层。不直接使用fabric.Canvas()作为view层，而是在其上简单封装一层。
      // 拦截事件
    };

    const handleMouseUp = (e) => {
      isPanning = false;
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        isSpaceDown = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        isSpaceDown = false;
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }
}
