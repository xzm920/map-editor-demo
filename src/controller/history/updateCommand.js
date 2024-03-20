export class UpdateCommand {
  constructor(item, changes, reason) {
    this.item = item;
    this.changes = changes;
    this.reason = reason;
  }

  execute() {
    const patch = {};
    for (const { key, next } of this.changes) {
      patch[key] = next;
    }
    this.item.update(patch, this.reason);
  }

  undo() {
    const inversePatch = {};
    for (const { key, prev } of this.changes) {
      inversePatch[key] = prev;
    }
    this.item.update(inversePatch, this.reason);
  }
}
