import { fabric } from 'fabric';

// mtr控件的图标
const rotateIcon = "data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.43231 7.14274C5.42128 7.04068 5.37277 6.94635 5.29618 6.878L4.51224 6.18504C4.96783 5.5036 5.61847 4.97551 6.37906 4.66984C7.3949 4.2594 8.51197 4.26966 9.52029 4.6972C10.5286 5.12474 11.3112 5.92168 11.7223 6.93752C11.7558 7.02088 11.8054 7.09682 11.8683 7.16098C11.9311 7.22514 12.0061 7.27626 12.0888 7.3114C12.1714 7.34654 12.2602 7.36502 12.3501 7.36578C12.4399 7.36653 12.529 7.34955 12.6123 7.3158C12.6956 7.28233 12.7716 7.23272 12.8357 7.16984C12.8999 7.10695 12.951 7.03202 12.9861 6.94934C13.0213 6.86667 13.0398 6.77786 13.0405 6.68803C13.0413 6.59819 13.0243 6.50909 12.9906 6.42583C12.7233 5.75836 12.3262 5.15057 11.8223 4.63766C11.3185 4.12475 10.7178 3.71693 10.0552 3.43783C9.39412 3.15529 8.68358 3.00655 7.96466 3.00021C7.24573 2.99387 6.53268 3.13005 5.86669 3.40089C4.91006 3.78608 4.08292 4.43574 3.48204 5.27387L2.68237 4.56654C2.62054 4.51144 2.54346 4.47637 2.4613 4.46595C2.37914 4.45554 2.29575 4.47026 2.22212 4.50818C2.1485 4.54611 2.08809 4.60545 2.04887 4.67839C2.00965 4.75134 1.99345 4.83445 2.00241 4.91678L2.27124 7.47519C2.28262 7.5834 2.3365 7.68265 2.42103 7.75115C2.50556 7.81965 2.61383 7.85178 2.72204 7.84048L5.06702 7.59422C5.12066 7.58859 5.17267 7.57244 5.22006 7.5467C5.26746 7.52095 5.30931 7.48612 5.34324 7.44419C5.37717 7.40226 5.40249 7.35405 5.41778 7.30233C5.43306 7.2506 5.438 7.19637 5.43231 7.14274ZM13.1739 9.01161L10.8392 9.33996C10.7602 9.35096 10.6861 9.38474 10.626 9.43717C10.5658 9.48961 10.5223 9.55842 10.5007 9.6352C10.4791 9.71198 10.4803 9.7934 10.5042 9.8695C10.5281 9.9456 10.5737 10.0131 10.6353 10.0637L11.3727 10.6711C10.8562 11.4943 10.0627 12.1061 9.13512 12.3961C8.20757 12.6862 7.20693 12.6356 6.31339 12.2534C5.81655 12.0443 5.36615 11.7386 4.98828 11.3542C4.61041 10.9697 4.31258 10.5141 4.11206 10.0138C4.04421 9.84549 3.91229 9.71106 3.74533 9.64006C3.57836 9.56905 3.39002 9.56728 3.22175 9.63513C3.05348 9.70298 2.91905 9.83491 2.84805 10.0019C2.77704 10.1688 2.77527 10.3572 2.84312 10.5254C3.11054 11.1929 3.50774 11.8007 4.01172 12.3136C4.5157 12.8265 5.11643 13.2344 5.77913 13.5134C6.45495 13.8018 7.18206 13.9507 7.91684 13.9512C8.61963 13.9506 9.31572 13.8145 9.96698 13.5504C10.9731 13.1464 11.8356 12.4511 12.444 11.5536L13.3292 12.2828C13.393 12.3352 13.4711 12.3671 13.5533 12.3744C13.6356 12.3817 13.7181 12.364 13.7901 12.3237C13.8621 12.2833 13.9203 12.2222 13.9571 12.1483C13.9938 12.0744 14.0074 11.9911 13.9961 11.9093L13.6384 9.36185C13.6231 9.25386 13.5656 9.15634 13.4785 9.09068C13.3915 9.02502 13.2819 8.99658 13.1739 9.01161Z' fill='%23282C4A'/%3E%3C/svg%3E";
const rotateImg = document.createElement('img');
rotateImg.src = rotateIcon;

// bl, br, mb, ml, mr, mt, tl, tr 控件自定义渲染
function renderControl(ctx, left, top, styleOverride, fabricObject) {
  ctx.save();
  ctx.translate(left, top);

  ctx.save();
  ctx.beginPath();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 3;
  ctx.fillStyle = '#FFF';
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = '#F7F7F7';
  ctx.lineWidth = 1;
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// mtr 控件自定义渲染
function renderMtrControl(ctx, left, top, styleOverride, fabricObject) {
  ctx.save();
  ctx.translate(left, top);

  ctx.save();
  ctx.beginPath();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 3;
  ctx.fillStyle = '#FFF';
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = '#F7F7F7';
  ctx.lineWidth = 1;
  ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  const size = 16;
  ctx.drawImage(rotateImg, -size/2, -size/2, size, size);
  ctx.restore();

  ctx.restore();
}

// ActiveSelection 控件自定义渲染
function renderActiveSelectionControl(ctx, left, top, styleOverride, fabricObject) {
  ctx.save();
  ctx.translate(left, top);

  ctx.save();
  ctx.lineWidth = 2 * window.devicePixelRatio;
  ctx.strokeStyle = '#8F7EF4';
  ctx.fillStyle = '#FFFFFF';
  ctx.rect(-2,-2,4,4);
  ctx.stroke();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function getImageControls() {
  const {
    scaleCursorStyleHandler,
    scalingEqually,
    scalingYOrSkewingX,
    scalingXOrSkewingY,
    scaleOrSkewActionName,
    rotationWithSnapping,
    rotationStyleHandler,
  } = fabric.controlsUtils;

  const ml = new fabric.Control({
    x: -0.5,
    y: 0,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
    render: renderControl,
    offsetX: -1,
  });

  const mr = new fabric.Control({
    x: 0.5,
    y: 0,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
    render: renderControl,
    offsetX: 1,
  });

  const mb = new fabric.Control({
    x: 0,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
    render: renderControl,
    offsetY: 1,
  });

  const mt = new fabric.Control({
    x: 0,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
    render: renderControl,
    offsetY: -1,
  });

  const tl = new fabric.Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
    render: renderControl,
    offsetX: -1,
    offsetY: -1,
  });

  const tr = new fabric.Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
    render: renderControl,
    offsetX: 1,
    offsetY: -1,
  });

  const bl = new fabric.Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
    render: renderControl,
    offsetX: -1,
    offsetY: 1,
  });

  const br = new fabric.Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: scaleCursorStyleHandler,
    actionHandler: scalingEqually,
    render: renderControl,
    offsetX: 1,
    offsetY: 1,
  });

  const mtr = new fabric.Control({
    x: 0,
    y: -0.5,
    actionHandler: rotationWithSnapping,
    cursorStyleHandler: rotationStyleHandler,
    withConnection: true,
    actionName: 'rotate',
    render: renderMtrControl,
    offsetY: -30,
  });
  
  return { ml, mr, mb, mt, tl, tr, bl, br, mtr };
}

function getTextControls() {
  const {
    scaleSkewCursorStyleHandler,
    changeWidth,
    rotationWithSnapping,
    rotationStyleHandler,
  } = fabric.controlsUtils;

  const ml = new fabric.Control({
    x: -0.5,
    y: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: 'resizing',
    render: renderControl,
    offsetX: -1,
  });

  const mr = new fabric.Control({
    x: 0.5,
    y: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionName: 'resizing',
    render: renderControl,
    offsetX: 1,
  });

  const mtr = new fabric.Control({
    x: 0,
    y: -0.5,
    actionHandler: rotationWithSnapping,
    cursorStyleHandler: rotationStyleHandler,
    withConnection: true,
    actionName: 'rotate',
    render: renderMtrControl,
    offsetY: -30,
  });

  return { ml, mr, mtr };
}

function getSelectionControls() {
  const tl = new fabric.Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: function () {},
    actionHandler: function () {},
    render: renderActiveSelectionControl,
    offsetX: -1,
    offsetY: -1,
  });

  const tr = new fabric.Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: function () {},
    actionHandler: function () {},
    render: renderActiveSelectionControl,
    offsetX: 1,
    offsetY: -1,
  });

  const bl = new fabric.Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: function () {},
    actionHandler: function () {},
    render: renderActiveSelectionControl,
    offsetX: -1,
    offsetY: 1,
  });

  const br = new fabric.Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: function () {},
    actionHandler: function () {},
    render: renderActiveSelectionControl,
    offsetX: 1,
    offsetY: 1,
  });

  return { tl, tr, bl, br };
}

export const imageControls = getImageControls();
export const backgroundImageControls = { ...imageControls };
delete backgroundImageControls.mtr;
export const textControls = getTextControls();
export const selectionControls = getSelectionControls();
