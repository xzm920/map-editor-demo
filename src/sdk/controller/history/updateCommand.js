export class UpdateCommand {
  constructor(item, changes) {
    this.item = item;
    this.changes = changes;
  }

  execute() {
    const patch = {};
    for (const { key, next } of this.changes) {
      patch[key] = next;
    }
    this.item.update(patch);
  }

  undo() {
    const inversePatch = {};
    for (const { key, prev } of this.changes) {
      inversePatch[key] = prev;
    }
    this.item.update(inversePatch);
  }
}
