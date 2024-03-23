import { EventEmitter } from '../../eventEmitter';
import { AddCommand } from './addCommand';
import { RemoveCommand } from './removeCommand';
import { SortItemCommand } from './sortItemCommand';
import { ToggleMaskPlayerCommand } from './toggleMaskPlayerCommand';
import { UpdateCommand } from './updateCommand';

export class HistoryManager extends EventEmitter {
  constructor(mapContainer) {
    super();
    

    this.mapContainer = mapContainer;
    this.maxUndoTimes = 100;
    this.undoStack = [];
    this.redoStack = [];
    this.stackItem = [];
    this.ignoreModelEvent = false;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const handleAdd = ({ mapItem }) => {
      // 在执行 undo/redo 的过程中不响应来自 model 的事件，避免发生循环调用
      if (this.ignoreModelEvent) return;
  
      const command = new AddCommand(this.mapContainer, mapItem);
      this.pushCommand(command);
    };

    const handleRemove = ({ mapItem }) => {
      if (this.ignoreModelEvent) return;
  
      const command = new RemoveCommand(this.mapContainer, mapItem);
      this.pushCommand(command);
    };

    const handleUpdate = ({ item, changes, reason }) => {
      if (this.ignoreModelEvent) return;

      const command = new UpdateCommand(item, changes, reason);
      this.pushCommand(command);
    };

    const handleSortItem = ({ mapLayer, mapItem, oldZOrder, newZOrder }) => {
      if (this.ignoreModelEvent) return;

      const command = new SortItemCommand(mapLayer, mapItem, oldZOrder, newZOrder);
      this.pushCommand(command);
    };

    const handleToggleMaskPlayer = ({ mapContainer, mapItem, oldZOrder, newZOrder }) => {
      if (this.ignoreModelEvent) return;

      const command = new ToggleMaskPlayerCommand(mapContainer, mapItem, oldZOrder, newZOrder);
      this.pushCommand(command);
    };

    this.mapContainer.on('add', handleAdd);
    this.mapContainer.on('remove', handleRemove);
    this.mapContainer.on('update', handleUpdate);
    this.mapContainer.on('sortItem', handleSortItem);
    this.mapContainer.on('toggleMaskPlayer', handleToggleMaskPlayer);

    return () => {
      this.mapContainer.off('add', handleAdd);
      this.mapContainer.off('remove', handleRemove);
      this.mapContainer.off('update', handleUpdate);
      this.mapContainer.off('sortItem', handleSortItem);
      this.mapContainer.off('toggleMaskPlayer', handleToggleMaskPlayer);
    };
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  undo() {
    const stackItem = this.undoStack.pop();
    if (!stackItem) return;

    this.ignoreModelEvent = true;
    for (const command of stackItem) {
      command.undo();
    }
    this.redoStack.push(stackItem);
    this.ignoreModelEvent = false;
    this.emit('history');
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  redo() {
    const stackItem = this.redoStack.pop();
    if (!stackItem) return;

    this.ignoreModelEvent = true;
    for (const command of stackItem) {
      command.execute();
    }
    this.undoStack.push(stackItem);
    this.ignoreModelEvent = false;
    this.emit('history');
  }

  pushCommand(command) {
    this.stackItem.push(command);
    if (this.batchScheduled) return;
    
    this.batchScheduled = true;
    Promise.resolve().then(() => {
      this.batchScheduled = false;
      this.pushStackItem(this.stackItem);
      this.stackItem = [];
      this.emit('history');
    });
  }

  pushStackItem(stackItem) {
    // 避免 push 空数组到 undoStack
    if (stackItem.length > 0) {
      this.redoStack = [];
      this.undoStack.push(stackItem);
    }
  }
}
