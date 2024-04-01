import { fabric } from 'fabric';
import { ASC_LAYERS, DEFAULT_LINE_HEIGHT, LAYER, MAP_ITEM_TYPE } from '../constants';
import { createActiveSelection, createBackgroundColor, createGrid, createImpassableRect, createMask, getItemViewCreator } from '../view';
import { EVENT } from '../event';
import { getBBox, isRectInRect } from '../geometry';

export class Presenter {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.model = mapEditor.model;
    this.canvas = mapEditor.canvas;
    const { width, height } = this.model;

    this.itemToObject = new Map();
    this.objectToItem = new Map();                                                        

    this.impassableItemToObject = new Map();

    this.backgroundColor = createBackgroundColor(width, height);
    this.grid = createGrid(width, height, () => this._render());
    this.mask = createMask(width, height);
    // TODO: 移出presenter
    this.toolView = null;

    this.canvas.add(this.backgroundColor);
    this.canvas.add(this.grid);
    this.canvas.add(this.mask);
    this._render();

    this._unlistenModel = this._listenModel();
    this._unlistenViewState = this._listenViewState();
    this._unlistenView = this._listenView();
  }

  dispose() {
    this._unlistenModel();
    this._unlistenViewState();
    this._unlistenView();
  }

  getViewByItem(item) {
    return this.itemToObject.get(item);
  }

  setViewByItem(item, data) {
    const objecct = this.itemToObject.get(item);
    if (objecct) {
      const options = itemToViewOptions({ ...item, ...data });
      objecct.set(options);
      this._render();
    }
  }

  // TODO: tool view ？？？
  addToolView(object) {
    this.toolView = object;
    this.canvas.add(object);
    this._updateObjects();
    this._render();
  }

  removeToolView(object) {
    this.toolView = null;
    this.canvas.remove(object);
    this._updateObjects();
    this._render();
  }

  updateToolView(options) {
    this.toolView.set(options);
    this._render();
  }

  _updateObjects() {
    const objects = [];
    const impassableObjects = [];
    objects.push(this.backgroundColor);

    const pushLayerObjects = (zIndex) => {
      const layer = this.model.getLayer(zIndex);
      layer.getItems().map((item) => {
        const object = this.itemToObject.get(item);
        objects.push(object);
        if (item.isCollider) {
          const impassableObject = this.impassableItemToObject.get(item);
          impassableObjects.push(impassableObject);
        }
      });
    };

    ASC_LAYERS.filter((zIndex) => zIndex !== LAYER.effect).map(pushLayerObjects);

    if (this.mapEditor.showMask) {
      objects.push(this.mask);
    }
    
    if (this.mapEditor.showMask || this.mapEditor.showEffect) {
      objects.push(...impassableObjects);
      pushLayerObjects(LAYER.effect);
    }

    objects.push(this.grid);

    if (this.toolView) {
      objects.push(this.toolView);
    }
    
    this.canvas._objects = objects;
  }

  _render() {
    this.canvas.requestRenderAll();
  }

  _getActive() {
    return this.canvas.getActiveObject();
  }

  _discardActive() {
    this.canvas.discardActiveObject();
  }

  _setActive(items) {
    const objects = items.map((item) => this.itemToObject.get(item));
    if (objects.length === 1) {
      this.canvas.setActiveObject(objects[0]);
    } else if (objects.length > 1) {
      const activeSelection = createActiveSelection(objects);
      activeSelection.canvas = this.canvas;
      this.canvas.setActiveObject(activeSelection);
    }
  }

  _scheduleNewSelection(object) {
    const activeObject = this._getActive();
    const objectInSelection = activeObject
      && activeObject.type === 'activeSelection'
      && activeObject.contains(object);
    if (objectInSelection) {
      if (!this._isScheduled) {
        this._discardActive();
        this._isScheduled = true;
        Promise.resolve().then(() => {
          this._isScheduled = false;
          const items = this.mapEditor.selection.items;
          this._setActive(items);
          this.canvas.requestRenderAll();
        });
      }
    }
  }

  _listenModel() {
    const handleAdd = ({ item }) => {
      const creator = getItemViewCreator(item.type);
      const options = itemToViewOptions(item);
      const object = creator(options, () => this._render());
      this.canvas.add(object);
      this.itemToObject.set(item, object);
      this.objectToItem.set(object, item);

      if (item.isCollider) {
        const impassableOptions = itemToImpassableOptions(item);
        const impassableRect = createImpassableRect(impassableOptions, () => this._render());
        this.canvas.add(impassableRect);
        this.impassableItemToObject.set(item, impassableRect);
      }
    
      this._updateObjects();
      this._render();
    };

    const handleRemove = ({ item }) => {
      const object = this.itemToObject.get(item);
      this._scheduleNewSelection(object);
      this.canvas.remove(object);
      this.itemToObject.delete(item);
      this.objectToItem.delete(object);

      if (item.isCollider) {
        const impassableRect = this.impassableItemToObject.get(item);
        this.canvas.remove(impassableRect);
        this.impassableItemToObject.delete(item);
      }

      this._updateObjects();
      this._render();
    };

    const handleUpdate = ({ item }) => {
      const object = this.itemToObject.get(item);
      this._scheduleNewSelection(object);
      const options = itemToViewOptions(item);
      object.set(options);

      let impassableRect = this.impassableItemToObject.get(item);
      const impassableOptions = itemToImpassableOptions(item);
      if (item.isCollider && impassableRect) {
        impassableRect.set(impassableOptions);
      } else if (item.isCollider && !impassableRect) {
        impassableRect = createImpassableRect(impassableOptions, () => this._render());
        this.canvas.add(impassableRect);
        this.impassableItemToObject.set(item, impassableRect);
      } else if (!item.isCollider && impassableRect) {
        this.canvas.remove(impassableRect);
        this.impassableItemToObject.delete(item);
      }

      this._updateObjects();
      this._render();

      this._focusTextInput();
    };

    const handleSortItem = () => {      
      this._updateObjects();
      this._render();
    };

    const handleToggleMaskPlayer = () => {  
      this._updateObjects();
      this._render();

      this._focusTextInput();
    };

    this.model.on(EVENT.add, handleAdd);
    this.model.on(EVENT.remove, handleRemove);
    this.model.on(EVENT.update, handleUpdate);
    this.model.on(EVENT.sortItem, handleSortItem);
    this.model.on(EVENT.toggleMaskPlayer, handleToggleMaskPlayer);

    return () => {
      this.model.off(EVENT.add, handleAdd);
      this.model.off(EVENT.remove, handleRemove);
      this.model.off(EVENT.update, handleUpdate);
      this.model.off(EVENT.sortItem, handleSortItem);
      this.model.off(EVENT.toggleMaskPlayer, handleToggleMaskPlayer);
    };
  }

  _listenViewState() {
    const handleToggleEffect = () => {
      this._updateObjects();
      this._render();
    };

    const handleToggleMaskPlayer = () => {
      this._updateObjects();
      this._render();
    };

    const handleViewportTransform = () => {
      const { zoom, translateX, translateY } = this.mapEditor;
      const vpt = [zoom, 0, 0, zoom, translateX, translateY];
      this.canvas.setViewportTransform(vpt);

      this._restartCursorImmediately();
      this._updateMask();
      this._render();
    };

    const handleViewportResize = () => {
      const { canvasWidth, canvasHeight } = this.mapEditor;  
      this.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
    };

    const handleSelectionChange = ({ items }) => {
      this._discardActive();
      this._setActive(items);
      this.canvas.requestRenderAll();
    };

    const handleSelectionMove = ({ pos }) => {
      const activeObject = this.canvas.getActiveObject();
      activeObject.set({ left: pos.x, top: pos.y });
      this.canvas.requestRenderAll();
    };

    this.mapEditor.on(EVENT.toggleEffect, handleToggleEffect);
    this.mapEditor.on(EVENT.toggleMask, handleToggleMaskPlayer);
    this.mapEditor.on(EVENT.viewportTransform, handleViewportTransform);
    this.mapEditor.on(EVENT.viewportResize, handleViewportResize);
    this.mapEditor.on(EVENT.selectionChange, handleSelectionChange);
    this.mapEditor.on(EVENT.selectionMove, handleSelectionMove);
    return () => {
      this.mapEditor.off(EVENT.toggleEffect, handleToggleEffect);
      this.mapEditor.off(EVENT.toggleMask, handleToggleMaskPlayer);
      this.mapEditor.off(EVENT.viewportTransform, handleViewportTransform);
      this.mapEditor.off(EVENT.viewportResize, handleViewportResize);
      this.mapEditor.off(EVENT.selectionChange, handleSelectionChange);
      this.mapEditor.off(EVENT.selectionMove, handleSelectionMove);
    };
  }

  _listenView() {
    const handleObjectModified = (e) => {
      const { action, target } = e;

      // 忽略group内的对象
      if (target.group) return;

      const mapItem = this.objectToItem.get(target);
      if (!mapItem) return;

      const mapBound = this.mapEditor.model.bbox;
      const bound = getBBox({left: target.left, top: target.top, width: target.width, height: target.height}, target.angle);
      if (!isRectInRect(bound, mapBound)) {
        // TODO: revert move
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

    const handleTextEditingEntered = () => {
      this.mapEditor.setIsEditing(true);
      //
    };

    const handleTextChanged = (e) => {
      const item = this.objectToItem.get(e.target);
      if (item) {
        const { text, height } = e.target;
        item.setText(text, height);
      }
    };

    const handleTextEditingExited = () => {
      this.mapEditor.setIsEditing(false);

      //
    };

    this.mapEditor.canvas.on('object:modified', handleObjectModified);
    this.mapEditor.canvas.on('object:scaling', handleObjectScaling);
    this.mapEditor.canvas.on('object:rotating', handleObjectRotating);
    this.mapEditor.canvas.on('object:resizing', handleObjectResizing);
    this.mapEditor.canvas.on('text:changed', handleTextChanged);
    this.mapEditor.canvas.on('text:editing:entered', handleTextEditingEntered);
    this.mapEditor.canvas.on('text:editing:exited', handleTextEditingExited);
    return () => {
      this.mapEditor.canvas.off('object:modified', handleObjectModified);
      this.mapEditor.canvas.off('object:scaling', handleObjectScaling);
      this.mapEditor.canvas.on('object:rotating', handleObjectRotating);
      this.mapEditor.canvas.off('object:resizing', handleObjectResizing);
      this.mapEditor.canvas.off('text:changed', handleTextChanged);
      this.mapEditor.canvas.off('text:editing:exited', handleTextEditingExited);
      this.mapEditor.canvas.on('text:editing:entered', handleTextEditingEntered);
    };
  }

  _updateMask() {
    const { invertTransform, qrDecompose } = fabric.util;
    const vpt = this.canvas.viewportTransform;
    const invertedVpt = invertTransform(vpt);
    const { scaleX, scaleY, translateX, translateY } = qrDecompose(invertedVpt);
    this.mask.set({
      left: translateX,
      top: translateY,
      width: this.canvas.width * scaleX,
      height: this.canvas.height * scaleY,
    });
  }

  _restartCursorImmediately() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox' && activeObject.isEditing) {
      activeObject.initDelayedCursor(true);
    }
  }

  // FIXME:
  _focusTextInput() {
    if (this.mapEditor.isEditing) {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox' && activeObject.isEditing) {
        activeObject.hiddenTextarea.focus();
      }
    }
  }
}

const tiledItemTypes = [
  MAP_ITEM_TYPE.floor,
  MAP_ITEM_TYPE.impassable,
  MAP_ITEM_TYPE.spawn,
  MAP_ITEM_TYPE.tiledObject,
  MAP_ITEM_TYPE.wall,
];

function itemToViewOptions(item) {
  if (tiledItemTypes.includes(item.type)) {
    return {
      left: item.left,
      top: item.top,
      width: item.width,
      height: item.height,
      imageURL: item.imageURL,
    };
  } else if (item.type === MAP_ITEM_TYPE.backgroundImage) {
    return {
      left: item.left,
      top: item.top,
      width: item.imageWidth,
      height: item.imageHeight,
      scaleX: item.width / item.imageWidth,
      scaleY: item.height / item.imageHeight,
      imageURL: item.imageURL,
    };
  } else if (item.type === MAP_ITEM_TYPE.image) {
    return {
      left: item.left,
      top: item.top,
      width: item.imageWidth,
      height: item.imageHeight,
      scaleX: item.width / item.imageWidth,
      scaleY: item.height / item.imageHeight,
      flipX: item.flipX,
      flipY: item.flipY,
      angle: item.angle,
      opacity: item.opacity,
      imageURL: item.imageURL,
    };
  } else if (item.type === MAP_ITEM_TYPE.text) {
    return {
      left: item.left,
      top: item.top,
      width: item.width,
      height: item.height,
      angle: item.angle,
      opacity: item.opacity,
      text: item.text,
      fill: item.color,
      fontSize: item.fontSize,
      fontStyle: transformItalic(item.isItalic),
      fontWeight: transformBold(item.isBold),
      underline: item.isUnderline,
      textAlign: transformAlign(item.horizontalAlign),
      lineHeight: transformLineHeight(item.lineHeight, item.fontSize),
    };
  } else {
    throw Error(`Map item type ${item.type} is not supported.`);
  }
}

function transformItalic(isItalic) {
  return isItalic ? 'italic' : 'normal';
}

function transformBold(isBold) {
  return isBold ? 700 : 400;
}

function transformAlign(horizontalAlign) {
  return horizontalAlign.toLowerCase();
}

function transformLineHeight(lineHeight, fontSize) {
  return lineHeight === null ? DEFAULT_LINE_HEIGHT : lineHeight / fontSize;
}

function itemToImpassableOptions(item) {
  return {
    left: item.left,
    top: item.top,
    width: item.width,
    height: item.height,
  };
}
