function degreeToRadian(angle) {
  return angle * Math.PI / 180;
}

function rotatePoint(p, p0, rad) {
  if (rad === 0) return p;

  const dx = p.x - p0.x;
  const dy = p.y - p0.y;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  return {
    x: dx * cos - dy * sin + p0.x,
    y: dx * sin + dy * cos + p0.y,
  };
}

function getPoints(rect, angle) {
  const tl = { x: rect.left, y: rect.top };
  const tr = { x: rect.left + rect.width, y: rect.top };
  const br = { x: rect.left + rect.width, y: rect.top + rect.height };
  const bl = { x: rect.left, y: rect.top + rect.height };
  if (angle === 0) {
    return { tl, tr, br, bl };
  }

  const rad = degreeToRadian(angle);
  return {
    tl,
    tr: rotatePoint(tr, tl, rad),
    br: rotatePoint(br, tl, rad),
    bl: rotatePoint(bl, tl, rad),
  };
}

function pointsToBBox(points) {
  const { tl, tr, br, bl } = points;
  const left = Math.min(tl.x, tr.x, br.x, bl.x);
  const top = Math.min(tl.y, tr.y, br.y, bl.y);
  const width = Math.max(tl.x, tr.x, br.x, bl.x) - left;
  const height = Math.max(tl.y, tr.y, br.y, bl.y) - top;
  return { left, top, width, height };
}

export function isPointInRect(point, rect) {
  return point.x >= rect.left
    && point.y >= rect.top
    && point.x <= rect.left + rect.width
    && point.y <= rect.top + rect.height;
}

export function isPointInRotatedRect(point, rect, angle) {
  const origin = { x: rect.left, y: rect.top };
  const radians = degreeToRadian(-angle);
  const rotatedPoint = rotatePoint(point, origin, radians);
  return isPointInRect(rotatedPoint, rect);
}

export function isRectInRect(rect1, rect2) {
  return rect1.left >= rect2.left
    && rect1.top >= rect2.top
    && rect1.left + rect1.width <= rect2.left + rect2.width
    && rect1.top + rect1.height <= rect2.top + rect2.height;
}

export function getBBox(rect, angle) {
  if (angle === 0) return rect;

  const points = getPoints(rect, angle);
  return pointsToBBox(points);
}

export function isRotatedRectIntersect(rect1, angle1, rect2, angle2) {
  if (angle1 === 0 && angle2 === 0) {
    return isRectIntersect(rect1, rect2);
  }

  // 按rect1的边投影
  let points2 = getPoints(rect2, angle2);
  if (angle1 !== 0) {
    const origin1 = { x: rect1.left, y: rect1.top };
    const radians2 = degreeToRadian(angle2 - angle1);
    const tl2 = rotatePoint(points2.tl, origin1, radians2);
    const tr2 = rotatePoint(points2.tr, origin1, radians2);
    const br2 = rotatePoint(points2.br, origin1, radians2);
    const bl2 = rotatePoint(points2.bl, origin1, radians2);
    points2 = { tl: tl2, tr: tr2, br: br2, bl: bl2 };
  }
  const bbox2 = pointsToBBox(points2);
  if (!isRectIntersect(rect1, bbox2)) {
    return false;
  }

  // 按rect2的边投影
  let points1 = getPoints(rect1, angle1);
  if (angle2 !== 0) {
    const origin2 = { x: rect2.left, y: rect2.top };
    const radians1 = degreeToRadian(angle1 - angle2);
    const tl1 = rotatePoint(points1.tl, origin2, radians1);
    const tr1 = rotatePoint(points1.tr, origin2, radians1);
    const br1 = rotatePoint(points1.br, origin2, radians1);
    const bl1 = rotatePoint(points1.bl, origin2, radians1);
    points1 = { tl: tl1, tr: tr1, br: br1, bl: bl1 };
  }
  const bbox1 = pointsToBBox(points1);
  if (!isRectIntersect(rect2, bbox1)) {
    return false;
  }

  return true;
}

export function isRectIntersect(rect1, rect2) {
  return rect1.left <= rect2.left + rect2.width
    && rect1.left + rect1.width >= rect2.left
    && rect1.top <= rect2.top + rect2.height
    && rect1.top + rect1.height >= rect2.top;
}
