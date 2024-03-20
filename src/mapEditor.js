import { MapContainer } from './model/mapContainer';
import { MapCanvas } from './view/mapCanvas';
import { HistoryManager } from './controller/history/historyManager';
import { EventEmitter } from './eventEmitter';
import { ToolSelect } from './controller/tool/toolSelect';

export class MapEditor extends EventEmitter {
  constructor(options) {
    super();

    const {
      elem,
      width = 20,
      height = 20,
      canvasWidth = 600,
      canvasHeight = 600,
    } = options;

    this.model = new MapContainer(width, height);
    this.view = new MapCanvas({
      mapContainer: this.model,
      elem,
      width,
      height,
      canvasWidth,
      canvasHeight,
    });
    this.history = new HistoryManager(this.model);

    this.toolSelect = new ToolSelect(this.model, this.view);

    this._unlisten = this._listen();
  }

  get zoom() {
    return this.view.zoom;
  }

  get minZoom() {
    return this.view.minZoom;
  }

  get maxZoom() {
    return this.view.maxZoom;
  }

  zoomToCenter(zoom) {
    this.view.zoomToCenter(zoom);
  }

  zoomToFit() {
    this.view.zoomToFit();
  }

  get showEffect() {
    return this.view.showEffect;
  }

  toggleEffect() {
    this.view.toggleEffect();
  }

  get showMask() {
    return this.view.showMask;
  }

  toggleMask() {
    this.view.toggleMask();
  }

  get canUndo() {
    return this.history.canUndo();
  }

  get canRedo() {
    return this.history.canRedo();
  }

  undo() {
    this.history.undo();
  }

  redo() {
    this.history.redo();
  }

  dispose() {
    this.toolSelect.dispose();
    this._unlisten();
  }

  _listen() {
    const handleHistory = () => {
      this.emit('history');
    };
    this.history.on('history', handleHistory);
    
    // 转发事件
    const handleViewEvent = (type, event) => {
      this.emit(type, event);
    };
    this.view.on('*', handleViewEvent);
    return () => {
      this.view.off('*', handleViewEvent);
      this.history.off('history', handleHistory);
    };
  }
}
