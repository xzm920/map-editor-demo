export class AddCommand {
  constructor(mapContainer, mapItem) {
    this.mapContainer = mapContainer;
    this.mapItem = mapItem;
  }

  execute() {
    this.mapContainer.add(this.mapItem);
  }

  undo() {
    this.mapContainer.remove(this.mapItem);
  }
}
