export class ToggleMaskPlayerCommand {
  constructor(mapContainer, mapItem, oldZOrder, newZOrder) {
    this.mapContainer = mapContainer;
    this.mapItem = mapItem;
    this.oldZOrder = oldZOrder;
    this.newZOrder = newZOrder;
  }

  execute() {
    this.mapContainer.toggleMaskPlayer(this.mapItem, this.newZOrder);
  }

  undo() {
    this.mapContainer.toggleMaskPlayer(this.mapItem, this.oldZOrder);
  }
}
