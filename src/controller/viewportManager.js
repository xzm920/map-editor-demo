import { EVENT } from "../event";

export class ViewportManager {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
  }

  resize(canvasWidth, canvasHeight) {
    this.mapEditor.canvasWidth = canvasWidth;
    this.mapEditor.canvasHeight = canvasHeight;
    this.mapEditor.emit(EVENT.viewportResize);

    const { zoom, translateX, translateY, panRestricted } = this.mapEditor;
    let newTranslateX = translateX;
    let newTranslateY = translateY;

    if (panRestricted) {
      [newTranslateX, newTranslateY] = this._restrictPan(newTranslateX, newTranslateY, zoom);
    }

    if (newTranslateX === translateX && newTranslateY === translateY) return;
    this.mapEditor.translateX = newTranslateX;
    this.mapEditor.translateY = newTranslateY;
    this.mapEditor.emit(EVENT.viewportTransform);
  }

  zoomToPoint(newZoom, x, y) {
    const { zoom, minZoom, maxZoom } = this.mapEditor;
    if (newZoom < minZoom) {
      newZoom = minZoom;
    } else if (newZoom > maxZoom) {
      newZoom = maxZoom;
    }
    if (newZoom === zoom) return;
    
    const { translateX, translateY, panRestricted } = this.mapEditor;
    let newTranslateX = x - newZoom / zoom * (x - translateX);
    let newTranslateY = y - newZoom / zoom * (y - translateY);

    if (panRestricted) {
      [newTranslateX, newTranslateY] = this._restrictPan(newTranslateX, newTranslateY, newZoom);
    }

    if (newTranslateX === translateX && newTranslateY === translateY) return;

    this.mapEditor.zoom = newZoom;
    this.mapEditor.translateX = newTranslateX;
    this.mapEditor.translateY = newTranslateY;
    this.mapEditor.emit(EVENT.viewportTransform);
    this.mapEditor.emit(EVENT.zoom, newZoom);
  }

  zoomToFit() {
    const { canvasWidth, canvasHeight, mapWidth, mapHeight, zoom, translateX, translateY } = this.mapEditor;

    const scaleX = canvasWidth / mapWidth;
    const scaleY = canvasHeight / mapHeight;
    const newZoom = Math.min(scaleX, scaleY);
    const newTranslateX = (canvasWidth - mapWidth * newZoom) / 2;
    const newTranslateY = (canvasHeight - mapHeight * newZoom) / 2;

    if (newZoom === zoom && newTranslateX === translateX && newTranslateY === translateY) return;

    this.mapEditor.zoom = newZoom;
    this.mapEditor.translateX = newTranslateX;
    this.mapEditor.translateY = newTranslateY;
    this.mapEditor.emit(EVENT.viewportTransform);
    this.mapEditor.emit(EVENT.zoom, newZoom);
  }

  zoomToCenter(zoom) {
    const { canvasWidth, canvasHeight } = this.mapEditor;
    const x = canvasWidth / 2;
    const y = canvasHeight / 2;
    this.zoomToPoint(zoom, x, y);
  }

  relativePan(x, y) {
    const { zoom, panRestricted, translateX, translateY } = this.mapEditor;

    let newTranslateX = translateX + x;
    let newTranslateY = translateY + y;

    if (panRestricted) {
      [newTranslateX, newTranslateY] = this._restrictPan(newTranslateX, newTranslateY, zoom);
    }
    
    if (newTranslateX === translateX && newTranslateY === translateY) return;

    this.mapEditor.translateX = newTranslateX;
    this.mapEditor.translateY = newTranslateY;
    this.mapEditor.emit(EVENT.viewportTransform);
  }

  _restrictPan(translateX, translateY, zoom) {
    const { panInset, canvasWidth, canvasHeight, mapWidth, mapHeight } = this.mapEditor;

    const relativeMapWidth = mapWidth * zoom;
    const relativeMapHeight = mapHeight * zoom;

    const lockedX = (canvasWidth - relativeMapWidth) / 2 > panInset;
    const leftInvalid = translateX > panInset;
    const rightInvalid = (canvasWidth - translateX - relativeMapWidth) >  panInset;
    if (lockedX) {
      translateX = (canvasWidth - relativeMapWidth) / 2;
    } else if (leftInvalid) {
      translateX = panInset;
    } else if (rightInvalid) {
      translateX = canvasWidth - relativeMapWidth - panInset;
    }

    const lockedY = (canvasHeight - relativeMapHeight) / 2 > panInset;
    const topInvalid = translateY > panInset;
    const bottomInvalid = (canvasHeight - translateY - relativeMapHeight) > panInset;
    if (lockedY) {
      translateY = (canvasHeight - relativeMapHeight) / 2;
    } else if (topInvalid) {
      translateY = panInset;
    } else if (bottomInvalid) {
      translateY = canvasHeight - relativeMapHeight - panInset;
    }

    return [translateX, translateY];
  }
}
