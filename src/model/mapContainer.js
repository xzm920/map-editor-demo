import { EventEmitter } from '../eventEmitter';
import { AvatarLayer, BackgroundLayer, EffectLayer, FloorLayer, FreeLayer, TiledLayer, WallLayer } from './mapLayer';
import { DESC_LAYERS, LAYER, USER_LAYER } from '../constants';
import { getMapItemCtor } from './mapItem'; 

export class MapContainer extends EventEmitter {
  constructor(width, height) {
    super();

    this.width = width;
    this.height = height;
    this.layers = this.createLayers(width, height);
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

  canAdd(mapItem) {
    const layer = this.getLayer(mapItem.zIndex);
    return layer.canAdd(mapItem);
  }

  add(mapItem) {
    const layer = this.getLayer(mapItem.zIndex);
    layer.add(mapItem);
  }

  remove(mapItem) {
    const layer = this.getLayer(mapItem.zIndex);
    layer.remove(mapItem);
  }

  toggleMaskPlayer(mapItem, zOrder) {
    // 业务限制不能同时设置isMaskPlayer,isCollider为true
    if (mapItem.isCollider) return;

    const layer = this.getLayer(mapItem.zIndex);
    if (mapItem.userLayer !== USER_LAYER.object && mapItem.userLayer !== USER_LAYER.freeObject) return;
    
    layer.remove(mapItem, false);
    const newZIndex = mapItem.getInverseLayer();
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
    this.emit('toggleMaskPlayer', data);
  }

  findMapItemByPoint(point, layers = DESC_LAYERS) {
    const descLayers = layers.slice().sort().reverse();
    for (const zIndex of descLayers) {
      const layer = this.getLayer(zIndex);
      const mapItem = layer.findMapItemByPoint(point);
      if (mapItem) {
        return mapItem;
      }
    }
    return null;
  }

  notify(event, data) {
    this.emit(event, data);
  }
}
