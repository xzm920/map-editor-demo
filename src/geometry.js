const { sin, cos, PI } = Math;

export function isPointInRect(point, rect) {
  return point.x >= rect.x
    && point.y >= rect.y
    && point.x <= rect.x + rect.width
    && point.y <= rect.y + rect.height;
}

export function isPointInRotatedRect(point, rect, angle) {
  const x1 = point.x - rect.x;
  const y1 = point.y - rect.y;
  const rad = toRadian(-angle);
  const x2 = x1 * cos(rad) - y1 * sin(rad);
  const y2 = x1 * sin(rad) + y1 * cos(rad);
  return x2 >= 0
    && y2 >= 0
    && x2 <= rect.width
    && y2 <= rect.height;
}

function toRadian(angle) {
  return angle * PI / 180;
}

export function isRectInRect(rect1, rect2) {
  return rect1.x >= rect2.x
    && rect1.y >= rect2.x
    && rect1.x + rect1.width <= rect2.x + rect2.width
    && rect1.y + rect1.height <= rect2.x + rect2.height;
}

export function getBoundingRect(rect, angle) {
  if (angle === 0) return rect;

  const rad = toRadian(angle);
  const tl = { x: rect.x, y: rect.y };
  const tr = { x: rect.x + rect.width, y: rect.y };
  const br = { x: rect.x + rect.width, y: rect.y + rect.height };
  const bl = { x: rect.x, y: rect.y + rect.height };
  const rtr = rotatePoint(tr, tl, rad);
  const rbr = rotatePoint(br, tl, rad);
  const rbl = rotatePoint(bl, tl, rad);
  const minX = Math.min(tl.x, rtr.x, rbr.x, rbl.x);
  const maxX = Math.max(tl.x, rtr.x, rbr.x, rbl.x);
  const minY = Math.min(tl.y, rtr.y, rbr.y, rbl.y);
  const maxY = Math.max(tl.y, rtr.y, rbr.y, rbl.y);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function rotatePoint(p, p0, rad) {
  const { x, y } = p;
  const { x: x0, y: y0 } = p0;
  return {
    x: (x - x0) * cos(rad) - (y - y0) * sin(rad) + x0,
    y: (x - x0) * sin(rad) + (y - y0) * cos(rad) + y0,
  };
}
