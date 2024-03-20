import { LAYER, MAP_ITEM_TYPE, USER_LAYER } from "../constants";
import { materials } from "../../mock/materials";
import { createMapItemFromMaterial } from "./create";

test('create floor with tiled pos', () => {
  const floor = createMapItemFromMaterial(materials.floor, 0, 0);
  expect(floor).toHaveProperty('parent', null);
  expect(floor).toHaveProperty('type', MAP_ITEM_TYPE.floor);
  expect(floor).toHaveProperty('id');
  expect(floor).toHaveProperty('zIndex', LAYER.floor);
  expect(floor).toHaveProperty('zOrder', null);
  expect(floor).toHaveProperty('left', 0);
  expect(floor).toHaveProperty('top', 0);
  expect(floor).toHaveProperty('width', 64);
  expect(floor).toHaveProperty('height', 64);
  expect(floor).toHaveProperty('angle', 0);
  expect(floor).toHaveProperty('userLayer', USER_LAYER.floor);
  expect(floor).toHaveProperty('isMaskPlayer', false);
  expect(floor).toHaveProperty('isCollider', false);
  expect(floor).toHaveProperty('materialId', materials.floor.code);
  expect(floor).toHaveProperty('name', materials.floor.name);
  expect(floor).toHaveProperty('imageURL', materials.floor.url);
});
