import { fabric } from "fabric";
import { debounce } from 'lodash';
import { ASC_LAYERS, LAYER, TILE_SIZE } from "../constants";
import { BackgroundColorView } from "./backgroundColorView";
import { GridView } from "./gridView";
import { getMapItemViewCtor } from "./mapItemView";
import { MaskView } from "./maskView";
import { MouseWheel } from "../controller/mouseWheel";
import { MouseMiddle } from "../controller/mouseMiddle";
import { EventEmitter } from "../eventEmitter";

fabric.Object.prototype.objectCaching = false;

export class MapCanvas extends EventEmitter {
  constructor({ mapContainer, elem, canvasWidth, canvasHeight, minZoom, maxZoom }) {
    super();

    this.mapContainer = mapContainer;
    this.elem = elem;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.minZoom = minZoom ?? 0.1;
    this.maxZoom = maxZoom ?? 1.5;
    const canvasOptions = {
      width: canvasWidth,
      height: canvasHeight,
      stopContextMenu: true,
      preserveObjectStacking: true,
      renderOnAddRemove: false,
      hoverCursor: 'default',
      backgroundColor: '#F1F4F7',
      selectionKey: undefined,
      selection: false,
      selectionColor: 'rgba(143, 126, 244, 0.3)',
      selectionBorderColor: '#8F7EF4',
      selectionLineWidth: 2,
    };
    this.canvas = new fabric.Canvas(elem, canvasOptions);
    this.canvas.on('after:render', () => {
      console.debug('[render]')
    });

    // state
    this.showMask = false; // 进入隔离模式
    this.showEffect = false;
    this.panRestricted = true;
    this.canvasPadding = 100;

    // controller
    this.mouseWheel = new MouseWheel(this);
    this.mouseMiddle = new MouseMiddle(this);

    // FIXME: 如何使用？
    this.debouncedRender = debounce(this.render, 50);

    const { width, height } = this.mapContainer;
    this.backgroundColorView = new BackgroundColorView(width, height);
    this.gridView = new GridView(width, height);
    this.maskView = new MaskView();
    this.add(this.backgroundColorView);
    this.add(this.gridView);
    this.add(this.maskView);
    this.maskView.update();

    this.debouncedRender();

    // Map: id => MapItemView
    this.itemViews = new Map();

    this._unlisten = this._listen();
  }

  get zoom() {
    return this.canvas.getZoom();
  }

  dispose() {
    this.mouseWheel.dispose();
    this.mouseMiddle.dispose();
    this._unlisten();
  }

  getItemView(mapItem) {
    return this.itemViews.get(mapItem.id);
  }

  setItemView(mapItem, itemView) {
    this.itemViews.set(mapItem.id, itemView);
  }

  _listen() {
    const handleAdd = ({ mapItem }) => {
      const ItemViewCtor = getMapItemViewCtor(mapItem.type);
      const itemView = new ItemViewCtor(mapItem);
      this.setItemView(mapItem, itemView);
      this.add(itemView);
      this.debouncedRender();
    };

    const handleRemove = ({ mapItem }) => {
      const itemView = this.getItemView(mapItem);
      this.setItemView(mapItem, null);
      this.remove(itemView);
      this.debouncedRender();
    };

    const handleUpdate = ({ item }) => {
      const itemView = this.getItemView(item);
      itemView.render();
    };

    const handleSortItem = () => {
      this.render();
    };

    const handleToggleMaskPlayer = () => {
      this.render();
    };

    this.mapContainer.on('add', handleAdd);
    this.mapContainer.on('remove', handleRemove);
    this.mapContainer.on('update', handleUpdate);
    this.mapContainer.on('sortItem', handleSortItem);
    this.mapContainer.on('toggleMaskPlayer', handleToggleMaskPlayer);
    return () => {
      this.mapContainer.off('add', handleAdd);
      this.mapContainer.off('remove', handleRemove);
      this.mapContainer.off('update', handleUpdate);
      this.mapContainer.off('sortItem', handleSortItem);
      this.mapContainer.off('toggleMaskPlayer', handleToggleMaskPlayer);
    };
  }

  add(view) {
    view.parent = this;
    this.canvas.add(view.object);
  }

  remove(view) {
    view.parent = null;
    this.canvas.remove(view.object);
  }

  onLoad() {
    this.debouncedRender();
  }

  onUpdate() {
    this.debouncedRender();
  }

  render() {
    const objects = [];
    const impassableObjects = [];
    objects.push(this.backgroundColorView.object);

    const pushLayerObjects = (zIndex) => {
      const layer = this.mapContainer.getLayer(zIndex);
      layer.getItems().map((item) => {
        const itemView = this.itemViews.get(item.id);
        objects.push(itemView.object);
        if (itemView.impassableObject) {
          impassableObjects.push(itemView.impassableObject);
        }
      });
    };

    ASC_LAYERS.filter((zIndex) => zIndex !== LAYER.effect).map(pushLayerObjects);

    if (this.showMask) {
      objects.push(this.maskView.object);
    }
    
    if (this.showMask || this.showEffect) {
      objects.push(...impassableObjects);
      pushLayerObjects(LAYER.effect);
    }

    objects.push(this.gridView.object);
    
    this.canvas._objects = objects;
    this.canvas.requestRenderAll();
  }

  toggleMask() {    
    this.showMask = !this.showMask;
    this.render();
    this.emit('toggleMask');
  }

  toggleEffect() {
    if (this.showMask) return;

    this.showEffect = !this.showEffect;
    this.render();
    this.emit('toggleEffect');
  }

  zoomToPoint(zoom, left, top) {
    this.canvas.zoomToPoint({ x: left, y: top }, zoom);
    if (this.panRestricted) {
      this._restrictMapPan();
    }
    // this._restartCursorImmediately();
    this.maskView.update();
    this.render();

    this.emit('zoom', this.zoom);
  }

  zoomToFit() {
    const { width, height } = this.mapContainer;
    const scaleX = this.canvasWidth / (width * TILE_SIZE);
    const scaleY = this.canvasHeight / (height * TILE_SIZE);
    const scale = Math.min(scaleX, scaleY);
    const translateX = (this.canvasWidth - width * TILE_SIZE * scale) / 2;
    const translateY = (this.canvasHeight - height * TILE_SIZE * scale) / 2;
    const vpt = [scale, 0, 0, scale, translateX, translateY];
    this.canvas.setViewportTransform(vpt);
    // this._restartCursorImmediately();
    this.maskView.update();
    this.render();

    this.emit('zoom', this.zoom);
  }

  zoomToCenter(zoom) {
    if (zoom === this.zoom) return;

    let newZoom = zoom;
    if (zoom < this.minZoom) {
      newZoom = this.minZoom;
    } else if (zoom > this.maxZoom) {
      newZoom = this.maxZoom;
    }

    const { left, top } = this.canvas.getCenter();
    this.zoomToPoint(newZoom, left, top);
    // this._restartCursorImmediately();
    this.maskView.update();
    this.render();
  }

  relativePan(left, top) {
    this.canvas.relativePan({ x: left, y: top });
    if (this.panRestricted) {
      this._restrictMapPan();
    }
    // this._restartCursorImmediately();
    this.maskView.update();
    this.render();
  }

  _restrictMapPan() {
    const { width, height } = this.mapContainer;
    const mapWidth = width * TILE_SIZE * this.canvas.getZoom();
    const mapHeight = height * TILE_SIZE * this.canvas.getZoom();
    const vpt = [...this.canvas.viewportTransform];

    let translateX = vpt[4];
    const lockedX = (this.canvasWidth - mapWidth) / 2 > this.canvasPadding;
    const leftInvalid = translateX > this.canvasPadding;
    const rightInvalid = (this.canvasWidth - translateX - mapWidth) > this.canvasPadding;
    if (lockedX) {
      translateX = (this.canvasWidth - mapWidth) / 2;
    } else if (leftInvalid) {
      translateX = this.canvasPadding;
    } else if (rightInvalid) {
      translateX = this.canvasWidth - mapWidth - this.canvasPadding;
    }
    vpt[4] = translateX;

    let translateY = vpt[5];
    const lockedY = (this.canvasHeight - mapHeight) / 2 > this.canvasPadding;
    const topInvalid = translateY > this.canvasPadding;
    const bottomInvalid = (this.canvasHeight - translateY - mapHeight) > this.canvasPadding;
    if (lockedY) {
      translateY = (this.canvasHeight - mapHeight) / 2;
    } else if (topInvalid) {
      translateY = this.canvasPadding;
    } else if (bottomInvalid) {
      translateY = this.canvasHeight - mapHeight - this.canvasPadding;
    }
    vpt[5] = translateY;

    if (vpt[4] !== this.canvas.viewportTransform[4] || vpt[5] !== this.canvas.viewportTransform[5]) {
      this.canvas.setViewportTransform(vpt);
    }
  }

  // _restartCursorImmediately() {
  //   const activeObject = this.canvas.getActiveObject();
  //   if (activeObject && activeObject.type === 'textbox' && activeObject.isEditing) {
  //     activeObject.initDelayedCursor(true);
  //   }
  // }

  setCanvasSize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
    if (this.panRestricted) {
      this._restrictMapPan();
    }
    this.maskView.update();
    this.render();
  }
}
