import { MAP_ITEM_TYPE } from "../constants";
import { createBackgroundImage } from "./backgroundImage";
import { createImage } from "./image";
import { createText } from "./text";
import { createTiled } from "./tiled";

const typeToCreator = {
  [MAP_ITEM_TYPE.backgroundImage]: createBackgroundImage,
  [MAP_ITEM_TYPE.floor]: createTiled,
  [MAP_ITEM_TYPE.wall]: createTiled,
  [MAP_ITEM_TYPE.tiledObject]: createTiled,
  [MAP_ITEM_TYPE.image]: createImage,
  [MAP_ITEM_TYPE.text]: createText,
  [MAP_ITEM_TYPE.spawn]: createTiled,
  [MAP_ITEM_TYPE.impassable]: createTiled,
};

export function getItemViewCreator(itemType) {
  const creator = typeToCreator[itemType];
  if (creator) {
    return creator;
  } else {
    throw Error(`Cannot find view creator for map item type ${itemType}`);
  }
}
