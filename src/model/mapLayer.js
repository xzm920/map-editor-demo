import { generateKeyBetween } from 'fractional-indexing';
import { LAYER } from '../constants';
import { isPointInRect, isPointInRotatedRect } from '../geometry';

export class MapLayer {
  constructor(width, height, zIndex) {
    this.parent = null;
    this.width = width;
    this.height = height;
    this.zIndex = zIndex;
    this.zOrders = [];
    this.zOrderToItem = new Map();
  }

  getItems() {
    return this.zOrders.map((zOrder) => this.zOrderToItem.get(zOrder));
  }

  getItemByZOrder(zOrder) {
    return this.zOrderToItem.get(zOrder);
  }

  // TODO: 优化算法
  findMapItemByPoint(point) {
    for (const zOrder of this.zOrders) {
      const mapItem = this.zOrderToItem.get(zOrder);
      const rect = { x: mapItem.left, y: mapItem.top, width: mapItem.width, height: mapItem.height };
      if (mapItem.angle === 0) {
        if (isPointInRect(point, rect)) {
          return mapItem;
        }
      } else {
        if (isPointInRotatedRect(point, rect, mapItem.angle)) {
          return mapItem;
        }
      }
    }
    return null;
  }

  add(mapItem, emit = true) {
    if (!mapItem.zOrder) {
      const highest = this.zOrders[this.zOrders.length - 1];
      mapItem.zOrder = generateKeyBetween(highest, null);
      this.zOrders.push(mapItem.zOrder);
    } else {
      this.zOrders.push(mapItem.zOrder);
      // TODO: 需要性能优化，执行时间超过1ms
      this.zOrders.sort();
    }
    this.zOrderToItem.set(mapItem.zOrder, mapItem);
    mapItem.parent = this;
    if (emit) {
      this.notify('add', { mapItem });
    }
  }

  remove(mapItem, emit = true) {
    const index = this.zOrders.indexOf(mapItem.zOrder);
    if (index === -1) return;

    this.zOrders.splice(index, 1);
    this.zOrderToItem.set(mapItem.zOrder, null);
    mapItem.parent = null;
    if (emit) {
      this.notify('remove', { mapItem });
    }
  }

  notify(event, data) {
    this.parent?.notify(event, data);
  }
}

export class BackgroundLayer extends MapLayer {
  constructor(width, height) {
    super(width, height, LAYER.background);
  }
}

export class FloorLayer extends MapLayer {
  constructor(width, height) {
    super(width, height, LAYER.floor);
  }

  canAdd(floor) {
    const existed = this.zOrders.some((zOrder) => {
      const item = this.zOrderToItem.get(zOrder);
      return item.left === floor.left && item.top === floor.top;
    });
    if (existed) {
      return false;
    }
    return true;
  }
}

export class WallLayer extends MapLayer {
  constructor(width, height, isMaskPlayer) {
    super(width, height, isMaskPlayer ? LAYER.wallFront : LAYER.wallBehind);
  }
}

class OverlapLayer extends MapLayer {
  sortItem(mapItem, zOrder) {
    const oldZOrder = mapItem.zOrder;
    this.zOrderToItem.set(oldZOrder, null);
    this.zOrderToItem.set(zOrder, mapItem);
    
    const index = this.zOrders.indexOf(oldZOrder);
    this.zOrders[index] = zOrder;
    this.zOrders.sort();
    mapItem.zOrder = zOrder;

    const data = {
      mapLayer: this,
      mapItem,
      oldZOrder,
      newZOrder: zOrder,
    };
    this.notify('sortItem', data);
  }

  levelUpAbove(mapItem, target) {
    if (mapItem === target) return;
    const index = this.zOrders.indexOf(mapItem.zOrder);
    const targetIndex = this.zOrders.indexOf(target.zOrder);
    if (index === targetIndex + 1) return;

    const zOrder = generateKeyBetween(this.zOrders[targetIndex], this.zOrders[targetIndex + 1]);
    this.sortItem(mapItem, zOrder);
  }

  levelDownBelow(mapItem, target) {
    if (mapItem === target) return;
    const index = this.zOrders.indexOf(mapItem.zOrder);
    const targetIndex = this.zOrders.indexOf(target.zOrder);
    if (index === targetIndex - 1) return;

    const zOrder = generateKeyBetween(this.zOrders[targetIndex - 1], this.zOrders[targetIndex]);
    this.sortItem(mapItem, zOrder);
  }
}

export class TiledLayer extends OverlapLayer {
  constructor(width, height, isMaskPlayer) {
    super(width, height, isMaskPlayer ? LAYER.objAboveAvatar : LAYER.objBelowAvatar);
  }
}

export class FreeLayer extends MapLayer {
  constructor(width, height, isMaskPlayer) {
    super(width, height, isMaskPlayer ? LAYER.freeObjAboveAvatar : LAYER.freeObjBelowAvatar);
  }
}

export class EffectLayer extends MapLayer {
  constructor(width, height) {
    super(width, height, LAYER.effect);
  }
}

export class AvatarLayer extends MapLayer {
  constructor(width, height) {
    super(width, height, LAYER.avatar);
  }
}
