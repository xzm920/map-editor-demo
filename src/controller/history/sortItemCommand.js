export class SortItemCommand {
  constructor(mapLayer, mapItem, oldZOrder, newZOrder) {
    this.mapLayer = mapLayer;
    this.mapItem = mapItem;
    this.oldZOrder = oldZOrder;
    this.newZOrder = newZOrder;
  }

  execute() {
    this.mapLayer.sortItem(this.mapItem, this.newZOrder);
  }

  undo() {
    this.mapLayer.sortItem(this.mapItem, this.oldZOrder);
  }
}
