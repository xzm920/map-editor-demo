import { MapContainer } from './model/mapContainer';
import { HistoryManager } from './controller/history';
import { EventEmitter } from './eventEmitter';
import { DESC_NON_EFFECT_LAYERS, LAYER, TILE_SIZE, TOOL } from './constants';
import { ToolManager, ToolErase, ToolHand, ToolSelect, ToolText } from './controller/tool';
import { Presenter } from './controller/presenter';
import { createCanvas } from './view';
import { MouseMiddle, MouseWheel } from './controller';
import { ViewportManager } from './controller/viewportManager';
import { EVENT } from './event';
import { Selection } from './controller/selection';
import { ToolFloor } from './controller/tool/toolFloor';
import { ToolWall } from './controller/tool/toolWall';
import { ToolTiled } from './controller/tool/toolTiled';
import { ToolImage } from './controller/tool/toolImage';
import { MouseSpace } from './controller/mouseSpace';
import { KeyboardShortcuts } from './controller/keyboardShortcuts';

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

    // state
    this.width = width;
    this.height = height;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.showMask = false;
    this.showEffect = false;
    this.alignTile = false;
    this.alignThreshold = 10;
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 1.5;
    this.translateX = 0;
    this.translateY = 0;
    this.panRestricted = true;
    this.panInset = 100;

    this.canvas = createCanvas(elem, canvasWidth, canvasHeight);
    this.presenter = new Presenter(this);
    this.selection = new Selection(this);
    this.isEditing = false;

    this.viewportManager = new ViewportManager(this);
    this.mouseWheel = new MouseWheel(this);
    this.mouseMiddle = new MouseMiddle(this);
    this.mouseSpace = new MouseSpace(this);
    this.keyboardShortcuts = new KeyboardShortcuts(this);

    this.history = new HistoryManager(this);

    this.toolManager = new ToolManager(this);
    this.toolManager.registerTool(TOOL.select, ToolSelect);
    this.toolManager.registerTool(TOOL.hand, ToolHand);
    this.toolManager.registerTool(TOOL.erase, ToolErase);
    this.toolManager.registerTool(TOOL.text, ToolText);
    this.toolManager.registerTool(TOOL.floor, ToolFloor);
    this.toolManager.registerTool(TOOL.wall, ToolWall);
    this.toolManager.registerTool(TOOL.tiled, ToolTiled);
    this.toolManager.registerTool(TOOL.image, ToolImage);
    this.toolManager.invokeTool(TOOL.select);

    this._unlisten = this._listen();
  }

  get mapWidth() {
    return this.width * TILE_SIZE;
  }

  get mapHeight() {
    return this.height * TILE_SIZE;
  }

  get bbox() {
    return {
      left: 0,
      top: 0,
      width: this.width * TILE_SIZE,
      height: this.height * TILE_SIZE,
    };
  }

  dispose() {
    this._unlisten();
    this.toolManager.stopTool();
    this.mouseWheel.dispose();
    this.mouseMiddle.dispose();
    this.selection.dispose();
    this.history.dispose();
    this.presenter.dispose();
    this.canvas.dispose();
  }
  
  // model
  add(mapItem) {
    this.model.add(mapItem);
  }

  remove(mapItem) {
    this.model.remove(mapItem);
  }

  getIntersectItems(mapItem) {
    return this.model.getIntersectItems(mapItem);
  }

  getItemByPoint(point) {
    const descLayers = this.showMask ? [LAYER.effect] : DESC_NON_EFFECT_LAYERS;
    return this.model.getItemByPoint(point, descLayers);
  }

  // selection
  select(itemOrItems) {
    this.selection.select(itemOrItems);
  }
  
  unselect(itemOrItems) {
    this.selection.unselect(itemOrItems);
  }

  resetSelection(itemOrItems) {
    this.selection.reset(itemOrItems);
  }
  
  clearSelection() {
    this.selection.clear();
  }

  // view
  getViewByItem(item) {
    return this.presenter.getViewByItem(item);
  }

  setViewByItem(item, data) {
    this.presenter.setViewByItem(item, data);
  }

  render() {
    this.canvas.requestRenderAll();
  }

  setCanvasSize(canvasWidth, canvasHeight) {
    this.viewportManager.resize(canvasWidth, canvasHeight);
  }

  zoomToPoint(zoom, left, top) {
    this.viewportManager.zoomToPoint(zoom, left, top);
  }

  zoomToCenter(zoom) {
    this.viewportManager.zoomToCenter(zoom);
  }

  zoomToFit() {
    this.viewportManager.zoomToFit();
  }

  relativePan(left, top) {
    this.viewportManager.relativePan(left, top);
  }

  toggleEffect() {
    this.showEffect = !this.showEffect;
    this.emit(EVENT.toggleEffect);
  }

  setMask(showMask) {
    this.showMask = showMask;
    this.emit(EVENT.toggleMask);
  }

  toggleAlignTile() {
    this.alignTile = !this.alignTile;
    this.emit(EVENT.toggleAlignTile);
  }

  setIsEditing(isEditing) {
    this.isEditing = isEditing;
    this.emit(EVENT.history);
  }

  // history
  canUndo() {
    return !this.isEditing && this.history.canUndo();
  }

  canRedo() {
    return !this.isEditing && this.history.canRedo();
  }

  undo() {
    this.history.undo();
  }

  redo() {
    this.history.redo();
  }

  startBatch() {
    this.history.startBatch();
  }

  stopBatch() {
    this.history.stopBatch();
  }

  abortBatch() {
    this.history.abortBatch();
  }

  // tool
  get currentTool() {
    return this.toolManager.current;
  }

  invokeTool(name, options) {
    this.toolManager.invokeTool(name, options);
  }

  stopTool() {
    this.toolManager.stopTool();
  }

  _listen() {
    // 转发来自model的事件
    const handleModelEvents = (type, eventData) => {
      this.emit(type, eventData);
    };

    this.model.on('*', handleModelEvents);
    return () => {
      this.model.on('*', handleModelEvents);
    };
  }
}
