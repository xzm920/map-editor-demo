import { MAP_ITEM_TYPE } from "../constants";
import { FloorView } from "./floorView";
import { TiledObjectView } from "./tiledObjectView";
import { WallView } from "./wallView";
import { ImageView } from './imageView';
import { TextView } from "./textView";
import { SpawnView } from "./spawnView";
import { ImpassableView } from "./impassableView";
import { BackgroundImageView } from "./backgroundImageView";

export function getMapItemViewCtor(mapItemType) {
  if (mapItemType === MAP_ITEM_TYPE.backgroundImage) {
    return BackgroundImageView;
  } else if (mapItemType === MAP_ITEM_TYPE.floor) {
    return FloorView;
  } else if (mapItemType === MAP_ITEM_TYPE.wall) {
    return WallView;
  } else if (mapItemType === MAP_ITEM_TYPE.tiledObject) {
    return TiledObjectView;
  } else if (mapItemType === MAP_ITEM_TYPE.image) {
    return ImageView;
  } else if (mapItemType === MAP_ITEM_TYPE.text) {
    return TextView;
  } else if (mapItemType === MAP_ITEM_TYPE.spawn) {
    return SpawnView;
  } else if (mapItemType === MAP_ITEM_TYPE.impassable) {
    return ImpassableView;
  }
  throw Error(`Cannot find view constructor for map item type ${mapItemType}`);
}
