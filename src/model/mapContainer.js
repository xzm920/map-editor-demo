import { EventEmitter } from '../eventEmitter';
import { AvatarLayer, BackgroundLayer, EffectLayer, FloorLayer, FreeLayer, TiledLayer, WallLayer } from './mapLayer';
import { DESC_LAYERS, LAYER, TILE_SIZE, USER_LAYER } from '../constants';
import { getMapItemCtor } from './mapItem';
import { EVENT } from '../event';
import { createMapItemFromMaterial } from './create';

export class MapContainer extends EventEmitter {
  constructor(width, height) {
    super();

    this.width = width;
    this.height = height;
    this.bbox = this.getBoundingRect();
    this.layers = this.createLayers(width, height);
  }

  getBoundingRect() {
    return { left: 0, top: 0, width: this.width * TILE_SIZE, height: this.height * TILE_SIZE };
  }

  createLayers(width, height) {
    const layers = new Map();
    layers.set(LAYER.background, new BackgroundLayer(width, height));
    layers.set(LAYER.floor, new FloorLayer(width, height));
    layers.set(LAYER.wallBehind, new WallLayer(width, height, false));
    layers.set(LAYER.freeObjBelowAvatar, new FreeLayer(width, height, false));
    layers.set(LAYER.objBelowAvatar, new TiledLayer(width, height, false));
    layers.set(LAYER.avatar, new AvatarLayer(width, height));
    layers.set(LAYER.objAboveAvatar, new TiledLayer(width, height, true));
    layers.set(LAYER.wallFront, new WallLayer(width, height, true));
    layers.set(LAYER.freeObjAboveAvatar, new FreeLayer(width, height, true));
    layers.set(LAYER.effect, new EffectLayer(width, height));
    for (let layer of layers.values()) {
      layer.parent = this;
    }
    return layers;
  }

  getLayer(zIndex) {
    const layer = this.layers.get(zIndex);
    if (!layer) throw Error(`Cannot find layer with zIndex ${zIndex}`);
    return layer;
  }

  reset(items) {
    for (const item of items) {
      const MapItemCtor = getMapItemCtor(item.type);
      const mapItem = new MapItemCtor(item);
      this.add(mapItem);
    }
  }

  save() {
    const items = [];
    const layers = this.layers.values();
    for (let layer of layers) {
      items.push(...layer.getItems());
    }
    return items;
  }

  canMove(mapItem, left, top) {
    if (mapItem.zIndex === LAYER.wallBehind || mapItem.zIndex === LAYER.wallFront) {
      const zIndex = mapItem.getOppositeLayer();
      const oppositeLayer = this.getLayer(zIndex);
      const existed = oppositeLayer.zOrders.some((zOrder) => {
        const item = oppositeLayer.zOrderToItem.get(zOrder);
        return item.left === left && item.top === top;
      });
      if (existed) {
        return false;
      }
    }
    return true;
  }

  add(mapItem) {
    const layer = this.getLayer(mapItem.zIndex);
    layer.add(mapItem);
  }

  remove(mapItem) {
    const layer = this.getLayer(mapItem.zIndex);
    layer.remove(mapItem);
  }

  has(mapItem) {
    const layer = this.getLayer(mapItem.zIndex);
    return layer.has(mapItem);
  }

  toggleMaskPlayer(mapItem, zOrder) {
    // 业务限制不能同时设置isMaskPlayer,isCollider为true
    if (mapItem.isCollider) return;

    const layer = this.getLayer(mapItem.zIndex);
    if (mapItem.userLayer !== USER_LAYER.object && mapItem.userLayer !== USER_LAYER.freeObject) return;
    
    this.notify(EVENT.beforeModelChange);
    layer.remove(mapItem, false);
    const newZIndex = mapItem.getOppositeLayer();
    const oldZOrder = mapItem.zOrder;
    mapItem.update({
      isMaskPlayer: !mapItem.isMaskPlayer,
      zIndex: newZIndex,
      zOrder: zOrder ?? null,
    });
    const newLayer = this.layers.get(newZIndex);
    newLayer.add(mapItem, false);
    
    const data = {
      mapContainer: this,
      mapItem,
      oldZOrder,
      newZOrder: mapItem.zOrder,
    };
    this.emit(EVENT.toggleMaskPlayer, data);
  }

  getItemByPoint(point, descLayers = DESC_LAYERS) {
    for (const zIndex of descLayers) {
      const layer = this.getLayer(zIndex);
      const mapItem = layer.getItemByPoint(point);
      if (mapItem) {
        return mapItem;
      }
    }
    return null;
  }

  getItemByRect(rect, descLayers = DESC_LAYERS) {
    for (const zIndex of descLayers) {
      const layer = this.getLayer(zIndex);
      const mapItem = layer.getItemByRect(rect);
      if (mapItem) {
        return mapItem;
      }
    }
    return null;
  }

  getIntersectItems(mapItem) {
    const layer = this.getLayer(mapItem.zIndex);
    return layer.getIntersectItems ? layer.getIntersectItems(mapItem) : [];
  }

  notify(event, data) {
    this.emit(event, data);
  }

  //
  batchAddOrReplaceFloors(material, rect) {
    if (material.layer !== USER_LAYER.floor) return;

    const layer = this.getLayer(LAYER.floor);
    layer.batchAddOrReplace(material, rect);
  }

  addOrReplaceWall(material, point) {
    if (material.layer !== USER_LAYER.wall) return;

    for (let zIndex of [LAYER.wallBehind, LAYER.wallFront]) {
      const layer = this.getLayer(zIndex); 
      let existed = layer.getItemByPoint(point);
      if (existed) {
        layer.remove(existed);
      }
    }

    const zIndex = material.shelter ? LAYER.wallFront : LAYER.wallBehind;
    const layer = this.getLayer(zIndex);
    const newItem = createMapItemFromMaterial(material, point.x, point.y);
    layer.add(newItem);
  }

  addTiled(material, point) {
    let zIndex = null;
    if (material.layer === USER_LAYER.object) {
      zIndex = material.shelter ? LAYER.objAboveAvatar : LAYER.objBelowAvatar;
    } else if (material.layer === USER_LAYER.effect) {
      zIndex = LAYER.effect;
    } else {
      return;
    }

    const layer = this.getLayer(zIndex);
    const newItem = createMapItemFromMaterial(material, point.x, point.y);
    layer.add(newItem);
  }

  addImage(material, point) {
    if (material.layer !== USER_LAYER.freeObject) return;

    const zIndex = material.shelter ? LAYER.freeObjAboveAvatar : LAYER.freeObjBelowAvatar;
    const layer = this.getLayer(zIndex);
    const newItem = createMapItemFromMaterial(material, point.x, point.y);
    layer.add(newItem);
  }
}
