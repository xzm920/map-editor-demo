export const LAYER = {
  effect: 9,
  freeObjAboveAvatar: 8,
  wallFront: 7,
  objAboveAvatar: 6,
  avatar: 5,
  objBelowAvatar: 4,
  freeObjBelowAvatar: 3,
  wallBehind: 2,
  floor: 1,
  background: 0,
};

export const ASC_LAYERS = [
  LAYER.background,
  LAYER.floor,
  LAYER.wallBehind,
  LAYER.freeObjBelowAvatar,
  LAYER.objBelowAvatar,
  LAYER.avatar,
  LAYER.objAboveAvatar,
  LAYER.wallFront,
  LAYER.freeObjAboveAvatar,
  LAYER.effect,
];

export const DESC_LAYERS = ASC_LAYERS.slice().reverse();

export const DESC_NON_EFFECT_LAYERS = DESC_LAYERS.filter((zIndex) => zIndex !== LAYER.effect);

export const USER_LAYER = {
  effect: 1,
  object: 2,
  wall: 3,
  floor: 4,
  freeObject: 5,
  npc: 6,
};

export const TILE_SIZE = 64;

export const MAP_ITEM_TYPE = {
  backgroundImage: 'backgroundImage',
  floor: 'floor',
  wall: 'wall',
  tiledObject: 'tiledObject',
  text: 'text',
  image: 'image',
  spawn: 'spawn',
  impassable: 'impassable',
  // TODO: more types
};

export const TOOL = {
  select: 'select',
  hand: 'hand',
  erase: 'erase',
  text: 'text',
  floor: 'floor',
  wall: 'wall',
  tiled: 'tiled',
  image: 'image',
  spawn: 'spawn',
  impassable: 'impassable',
};

export const IMPASSABLE_URL = 'https://dev-oss.vland.live/material/system/65433e2848c544d1ab0c43a51043f095_1649646689.png';

export const TEXT_ALIGN = {
  left: 'LEFT',
  center: 'CENTER',
  right: 'RIGHT',
};

export const DEFAULT_TEXT_ALIGN = TEXT_ALIGN.left;
export const DEFAULT_FONT_SIZE = 24;
export const DEFAULT_LINE_HEIGHT = 1.2;
export const DEFAULT_TEXT_COLOR = '#000';

export const THEME = {
  primaryColor: '#8F7EF4',
  textColor: '#282C4A',
};

export const SELECTION = {
  none: 'none',
  single: 'single',
  multiple: 'multiple',
};

export const EFFECT = {
  spawn: '出生点',
  impassable: '禁行区域',
};
