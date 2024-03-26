import { MapContainer } from './model/mapContainer';
import { MapCanvas } from './view/mapCanvas';
import { HistoryManager } from './controller/history/historyManager';
import { EventEmitter } from './eventEmitter';
import { ToolSelect } from './controller/tool/toolSelect';
import { Selection } from './controller/selection';
import { ToolManager } from './controller/tool/toolManager';
import { TOOL } from './constants';
import { ToolHand } from './controller/tool/toolHand';
import { ToolErase } from './controller/tool/toolErase';

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
    this.selection = new Selection(this);

    this.toolManager = new ToolManager(this);
    this.toolManager.registerTool(TOOL.select, ToolSelect);
    this.toolManager.registerTool(TOOL.hand, ToolHand);
    this.toolManager.registerTool(TOOL.erase, ToolErase);
    this.toolManager.invokeTool(TOOL.select);

    this._unlisten = this._listen();
  }

  select(items) {
    this.selection.select(items);
  }

  unselect() {
    this.selection.unselect();
  }

  getItemByPoint(point) {
    return this.selection.getItemByPoint(point);
  }

  dispose() {
    this.toolManager.stopTool();
    this.view.dispose();
    this.history.dispose();
    this._unlisten();
  }

  _listen() {
    const handleModelEvent = (type, event) => {
      this.emit(type, event);
    };
    const handleViewEvent = (type, event) => {
      this.emit(type, event);
    };
    const handleHistory = () => {
      this.emit('history');
    };

    this.model.on('*', handleModelEvent);
    this.view.on('*', handleViewEvent);
    this.history.on('history', handleHistory);
    return () => {
      this.model.off('*', handleModelEvent);
      this.view.off('*', handleViewEvent);
      this.history.off('history', handleHistory);
    };
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

  get alignTile() {
    return this.view.alignTile;
  }

  toggleAlignTile() {
    this.view.toggleAlignTile();
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

  add(mapItem) {
    this.model.add(mapItem);
  }

  remove(mapItem) {
    this.model.remove(mapItem);
  }

  getIntersectItems(mapItem) {
    return this.model.getIntersectItems(mapItem);
  }

  get currentTool() {
    return this.toolManager.current;
  }

  invokeTool(name) {
    this.toolManager.invokeTool(name);
  }

  stopTool() {
    this.toolManager.stopTool();
  }
}
