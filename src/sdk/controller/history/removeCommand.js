export class RemoveCommand {
  constructor(mapContainer, mapItem) {
    this.mapContainer = mapContainer;
    this.mapItem = mapItem;
  }

  execute() {
    this.mapContainer.remove(this.mapItem);
  }

  undo() {
    this.mapContainer.add(this.mapItem);
  }
}
