export class UpdateCommand {
  constructor(item, changes, merge = false) {
    this.item = item;
    this.changes = changes;
    this.merge = merge;
  }

  mergeCommand(nextCommand) {
    const changesMap = this.changes.reduce((map, item) => {
      map[item.key] = item;
      return map;
    }, {});

    for (let change of nextCommand.changes) {
      if (change.key in changesMap) {
        changesMap[change.key].next = change.next;
      } else {
        this.changes.push(change);
      }
    }
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
