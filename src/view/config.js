export const baseOptions = {
  lockMovementX: true,
  lockMovementY: true,
  hasControls: false,
  strokeWidth: 0,
  borderScaleFactor: 2,
  borderColor: '#8F7EF4',
  borderOpacityWhenMoving: 1,
  selectable: false,
};

export const textOptions = {
  ...baseOptions,
  fontFamily: 'PingFang SC, Microsoft YaHei, Noto Sans, sans-serif',
  splitByGrapheme: true,
  editingBorderColor: '#8F7EF4',
  cursorColor: '#282C4A',
};
