import { DEFAULT_TEXT_COLOR, DEFAULT_FONT_SIZE, LAYER, MAP_ITEM_TYPE, USER_LAYER, DEFAULT_TEXT_ALIGN, TILE_SIZE } from "../constants";
import { patchToChanges, uuid } from "../utils";
import { calcBoundingRect, isRectInRect } from '../geometry';

export class MapItem {
  // FIXME:
  constructor(options) {
    this.parent = null;
    this.type = options.type ?? null;
    this.id = options.id ?? uuid();
    this.zIndex = options.zIndex ?? null;
    this.zOrder = options.zOrder ?? null;
    this.left = options.left ?? null;
    this.top = options.top ?? null;
    this.width = options.width ?? null;
    this.height = options.height ?? null;
    this.angle = options.angle ?? 0;
    this.userLayer = options.userLayer ?? null;
    this.isMaskPlayer = options.isMaskPlayer ?? null;
    this.isCollider = options.isCollider ?? null;
  }

  toJSON() {
    return {
      type: this.type,
      id: this.id,
      zIndex: this.zIndex,
      zOrder: this.zOrder,
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      angle: this.angle,
      userLayer: this.userLayer,
      isMaskPlayer: this.isMaskPlayer,
      isCollider: this.isCollider,
    };
  }

  get tiled() {
    return this.zIndex !== LAYER.background
      && this.zIndex !== LAYER.freeObjBelowAvatar
      && this.zIndex !== LAYER.freeObjAboveAvatar;
  }

  getBoundingRect(left, top) {
    return calcBoundingRect({
      left: left ?? this.left,
      top: top ?? this.top,
      width: this.width,
      height: this.height,
    }, this.angle);
  }

  canMove(left, top) {
    if (this.tiled && (left % TILE_SIZE !== 0 || top % TILE_SIZE !== 0)) {
      return false;
    }
    if (!this.parent.canMove(this, left, top)) {
      return false;
    }
    if (!this.parent.parent.canMove(this, left, top)) {
      return false;
    }
    return true;
  }

  move(left, top) {
    if (!this.canMove(left, top)) {
      throw Error(`Cannot not move to (${left}, ${top})`);
    }
    
    if (left !== this.left || top !== this.top) {
      this.update({ left, top });
    }
  }

  update(patch, reason) {
    const changes = patchToChanges(this, patch);
    Object.assign(this, patch);

    const data = {
      item: this,
      patch,
      changes,
      reason,
    };
    this.notify('update', data);
  }

  notify(event, data) {
    this.parent?.notify(event, data);
  }
}

export class BackgroundImage extends MapItem {
  constructor(options) {
    super(options);

    this.type = MAP_ITEM_TYPE.backgroundImage;
    this.userLayer = null;
    this.zIndex = LAYER.background;
    this.width = options.width;
    this.height = options.height;
    this.imageWidth = options.imageWidth ?? options.width;
    this.imageHeight = options.imageHeight ?? options.height;
    this.resourceId = options.resourceId;
    this.name = options.name;
    this.imageURL = options.imageURL;
  }

  scale(left, top, width, height) {
    this.update({ left, top, width, height });
  }
}

export class Floor extends MapItem {
  constructor(options) {
    super(options);

    this.type = MAP_ITEM_TYPE.floor;
    this.userLayer = USER_LAYER.floor;
    this.zIndex = LAYER.floor;
    this.isMaskPlayer = false;
    this.isCollider = false;
    this.materialId = options.materialId;
    this.name = options.name;
    this.imageURL = options.imageURL;
  }
}

export class Wall extends MapItem {
  constructor(options) {
    super(options);

    this.type = MAP_ITEM_TYPE.wall;
    this.userLayer = USER_LAYER.wall;
    this.zIndex = options.isMaskPlayer ? LAYER.wallFront : LAYER.wallBehind;
    this.materialId = options.materialId;
    this.name = options.name;
    this.imageURL = options.imageURL;
  }

  getOppositeLayer() {
    return this.zIndex === LAYER.wallFront ? LAYER.wallBehind : LAYER.wallFront;
  }
}

export class TiledObject extends MapItem {
  constructor(options) {
    super(options);

    this.type = MAP_ITEM_TYPE.tiledObject;
    this.userLayer = USER_LAYER.object;
    this.zIndex = options.isMaskPlayer ? LAYER.objAboveAvatar : LAYER.objBelowAvatar;
    this.materialId = options.materialId;
    this.name = options.name;
    this.imageURL = options.imageURL;
  }

  getOppositeLayer() {
    return this.zIndex === LAYER.objAboveAvatar ? LAYER.objBelowAvatar : LAYER.objAboveAvatar;
  }

  toggleMaskPlayer() {
    this.parent.parent.toggleMaskPlayer(this);
  }

  toggleCollider() {
    // 业务限制不能同时设置isMaskPlayer,isCollider为true
    if (this.isMaskPlayer) return;

    this.update({
      isCollider: !this.isCollider,
    });
  }
}

export class MapImage extends MapItem {
  constructor(options) {
    super(options);

    this.type = MAP_ITEM_TYPE.image;
    this.userLayer = USER_LAYER.freeObject;
    this.zIndex = options.isMaskPlayer ? LAYER.freeObjAboveAvatar : LAYER.freeObjBelowAvatar;
    this.width = options.width;
    this.height = options.height;
    this.imageWidth = options.imageWidth ?? options.width;
    this.imageHeight = options.imageHeight ?? options.height;
    this.materialId = options.materialId;
    this.name = options.name;
    this.imageURL = options.imageURL;
    this.opacity = options.opacity ?? 1;
    this.flipX = options.flipX ?? false;
    this.flipY = options.flipY ?? false;
  }

  toggleMaskPlayer() {
    this.parent.parent.toggleMaskPlayer(this);
  }

  getOppositeLayer() {
    return this.zIndex === LAYER.freeObjAboveAvatar ? LAYER.freeObjBelowAvatar : LAYER.freeObjAboveAvatar;
  }

  setOpacity(opacity) {
    this.update({ opacity });
  }

  scaleFlip(left, top, width, height, flipX, flipY) {
    this.update({ left, top, width, height, flipX, flipY });
  }

  rotate(angle, left, top) {
    this.update({ angle, left, top });
  }
}

export class MapText extends MapItem {
  constructor(options) {
    super(options);

    this.type = MAP_ITEM_TYPE.text;
    this.userLayer = USER_LAYER.freeObject;
    this.zIndex = options.isMaskPlayer ? LAYER.freeObjAboveAvatar : LAYER.freeObjBelowAvatar;
    this.height = options.height ?? 0; // TODO:
    this.text = options.text ?? '';
    this.fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;
    this.color = options.color ?? DEFAULT_TEXT_COLOR;
    this.opacity = options.opacity ?? 1;
    this.isItalic = options.isItalic ?? false;
    this.isBold = options.isBold ?? false;
    this.isUnderline = options.isUnderline ?? false;
    this.horizontalAlign = options.horizontalAlign ?? DEFAULT_TEXT_ALIGN;
    this.lineHeight = options.lineHeight ?? null;
  }

  getOppositeLayer() {
    return this.zIndex === LAYER.freeObjAboveAvatar ? LAYER.freeObjBelowAvatar : LAYER.freeObjAboveAvatar;
  }

  toggleMaskPlayer() {
    this.parent.parent.toggleMaskPlayer(this);
  }

  rotate(angle, left, top) {
    this.update({ angle, left, top });
  }

  resize(left, top, width, height) {
    this.update({ left, top, width, height });
  }

  setText(text, height) {
    this.update({ text, height });
  }

  setOpacity(opacity) {
    this.update({ opacity });
  }

  setFontSize(fontSize) {
    this.update({ fontSize });
  }

  setColor(color) {
    this.update({ color });
  }

  setItalic(isItalic) {
    this.update({ isItalic });
  }

  setBold(isBold) {
    this.update({ isBold });
  }

  setUnderline(isUnderline) {
    this.update({ isUnderline });
  }

  setTextAlign(horizontalAlign) {
    this.update({ horizontalAlign });
  }

  setLineHeight(lineHeight) {
    this.update({ lineHeight });
  }
}

export class Spawn extends MapItem {
  constructor(options) {
    super(options);

    this.type = MAP_ITEM_TYPE.spawn;
    this.userLayer = USER_LAYER.effect;
    this.zIndex = LAYER.effect;
    this.materialId = options.materialId;
    this.name = options.name;
    this.imageURL = options.imageURL;
  }
}

export class Impassable extends MapItem {
  constructor(options) {
    super(options);

    this.type = MAP_ITEM_TYPE.impassable;
    this.userLayer = USER_LAYER.effect;
    this.zIndex = LAYER.effect;
    this.materialId = options.materialId;
    this.name = options.name;
    this.imageURL = options.imageURL;
  }
}

const typeToCtor = new Map();
typeToCtor.set(MAP_ITEM_TYPE.backgroundImage, BackgroundImage);
typeToCtor.set(MAP_ITEM_TYPE.floor, Floor);
typeToCtor.set(MAP_ITEM_TYPE.wall, Wall);
typeToCtor.set(MAP_ITEM_TYPE.tiledObject, TiledObject);
typeToCtor.set(MAP_ITEM_TYPE.text, MapText);
typeToCtor.set(MAP_ITEM_TYPE.image, MapImage);
typeToCtor.set(MAP_ITEM_TYPE.spawn, Spawn);
typeToCtor.set(MAP_ITEM_TYPE.impassable, Impassable);

export function getMapItemCtor(type) {
  return typeToCtor.get(type);
}
