import { MAP_ITEM_TYPE, USER_LAYER } from "../constants";
import { BackgroundImage, MapText, getMapItemCtor } from "./mapItem";

export function createMapItemFromMaterial(material, left, top) {
  const itemType = getMapItemTypeFromMaterial(material);
  const ItemCtor = getMapItemCtor(itemType);
  return new ItemCtor({
    left,
    top,
    width: material.w,
    height: material.h,
    userLayer: material.layer,
    isMaskPlayer: material.shelter,
    isCollider: material.obstacle,
    materialId: material.code,
    name: material.name,
    imageURL: material.url,
  });
}

export function createImageFromResource(resource, left, top) {
  // TODO:
}

export function createBackgroundImageFromResource(resource, left, top) {
  return new BackgroundImage({
    left,
    top,
    width: resource.w,
    height: resource.h,
    userLayer: null,
    isMaskPlayer: false,
    isCollider: false,
    resourceId: resource.id,
    name: resource.name,
    imageURL: resource.url,
  });
}

export function createText(text, left, top) {
  return new MapText({
    text,
    left,
    top,
    width: 100,
    height: 27,
    isMaskPlayer: false,
    isCollider: false,
  });
}

function getMapItemTypeFromMaterial(material) {
  if (material.layer === USER_LAYER.floor) {
    return MAP_ITEM_TYPE.floor;
  } else if (material.layer === USER_LAYER.wall) {
    return MAP_ITEM_TYPE.wall;
  } else if (material.layer === USER_LAYER.object) {
    return MAP_ITEM_TYPE.tiledObject;
  } else if (material.layer === USER_LAYER.freeObject) {
    return MAP_ITEM_TYPE.image;
  } else if (material.layer === USER_LAYER.effect) {
    if (material.name === '出生点') {
      return MAP_ITEM_TYPE.spawn;
    } else if (material.name === '禁行区域') {
      return MAP_ITEM_TYPE.impassable;
    }
  }
  throw new Error(`Cannot guess type of material: `, material);
}
