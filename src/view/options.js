import { THEME } from "../constants";

export const baseOptions = {
  strokeWidth: 0,
  borderScaleFactor: 2,
  borderColor: THEME.primaryColor,
  borderOpacityWhenMoving: 1,
  lockMovementX: true,
  lockMovementY: true,
  hasControls: false,
  selectable: false,
  objectCaching: false,
};

export const tiledOptions = {
  ...baseOptions,
};

export const imageOptions = {
  ...baseOptions,
  padding: 6,
  hasControls: true,
};

export const backgroundImageOptions = {
  ...baseOptions,
  padding: 6,
  hasControls: true,
  lockScalingFlip: true,
};

export const textOptions = {
  ...baseOptions,
  fontFamily: 'PingFang SC, Microsoft YaHei, Noto Sans, sans-serif',
  splitByGrapheme: true,
  editingBorderColor: THEME.primaryColor,
  cursorColor: THEME.textColor,
  padding: 6,
  hasControls: true,
};

export const activeSelectionOptions = {
  ...baseOptions,
  cornerColor: '#FFFFFF',
  cornerStrokeColor: THEME.primaryColor,
  hasControls: true,
};

export const simpleOptions = {
  strokeWidth: 0,
  selectable: false,
  evented: false,
  hasControls: false,
  objectCaching: false,
};
