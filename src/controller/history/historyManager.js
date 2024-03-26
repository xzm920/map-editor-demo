import { EventEmitter } from '../../eventEmitter';
import { shallowEqual } from '../../utils';
import { AddCommand } from './addCommand';
import { RemoveCommand } from './removeCommand';
import { SortItemCommand } from './sortItemCommand';
import { ToggleMaskPlayerCommand } from './toggleMaskPlayerCommand';
import { UpdateCommand } from './updateCommand';

export class HistoryManager extends EventEmitter {
  constructor(mapContainer) {
    super();
    
    this.mapContainer = mapContainer;
    // this.maxUndoTimes = 100;
    this.undoStack = [];
    this.redoStack = [];
    this._isBatching = false;
    this._batchCommands = [];
    this.mergeThreshold = 1000;
    this._lastCommandTime = null;
    this._isBusy = false;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const handleAdd = ({ mapItem }) => {
      // 在执行 undo/redo 的过程中不响应来自 model 的事件，避免发生循环调用
      if (this._isBusy) return;
  
      const command = new AddCommand(this.mapContainer, mapItem);
      this._pushCommand(command);
    };

    const handleRemove = ({ mapItem }) => {
      if (this._isBusy) return;
  
      const command = new RemoveCommand(this.mapContainer, mapItem);
      this._pushCommand(command);
    };

    const handleUpdate = ({ item, changes, merge }) => {
      if (this._isBusy) return;

      const command = new UpdateCommand(item, changes, merge);
      this._pushCommand(command);
    };

    const handleSortItem = ({ mapLayer, mapItem, oldZOrder, newZOrder }) => {
      if (this._isBusy) return;

      const command = new SortItemCommand(mapLayer, mapItem, oldZOrder, newZOrder);
      this._pushCommand(command);
    };

    const handleToggleMaskPlayer = ({ mapContainer, mapItem, oldZOrder, newZOrder }) => {
      if (this._isBusy) return;

      const command = new ToggleMaskPlayerCommand(mapContainer, mapItem, oldZOrder, newZOrder);
      this._pushCommand(command);
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

  _isBatchCommand(command) {
    return Array.isArray(command);
  }

  canUndo() {
    return this.undoStack.length > 0 && !this._isBatching;
  }

  canRedo() {
    return this.redoStack.length > 0 && !this._isBatching;
  }

  undo() {
    const command = this.undoStack.pop();
    if (!command) return;

    this._isBusy = true;
    if (this._isBatchCommand(command)) {
      for (const subCommand of command) {
        subCommand.undo();
      }
    } else {
      command.undo();
    }
    this.redoStack.push(command);
    this._isBusy = false;
    this.emit('history');
  }

  redo() {
    const command = this.redoStack.pop();
    if (!command) return;

    this._isBusy = true;
    if (this._isBatchCommand(command)) {
      for (const subCommand of command) {
        subCommand.execute();
      }
    } else {
      command.execute();
    }
    this.undoStack.push(command);
    this._isBusy = false;
    this.emit('history');
  }

  _pushCommand(command) {
    const currentStack = this._isBatching ? this._batchCommands : this.undoStack;

    // 处理合并
    const prevCommand = currentStack[currentStack.length - 1];
    if (prevCommand && this._shouldMerge(prevCommand, command)) {
      prevCommand.mergeCommand(command);
      this._lastCommandTime = Date.now();
      return;
    }

    currentStack.push(command);
    this._lastCommandTime = Date.now();
  }

  _shouldMerge(prevCommand, command) {
    return (this._isBatching || Date.now() - this._lastCommandTime <= this.mergeThreshold)
      && prevCommand instanceof UpdateCommand
      && command instanceof UpdateCommand
      && prevCommand.merge
      && command.merge
      && prevCommand.item === command.item
      && shallowEqual(
        prevCommand.changes.map((v) => v.key),
        command.changes.map((v) => v.key)
      );
  }

  _flushBatchCommands() {
    if (this._batchCommands.length > 0) {
      this.redoStack = [];
      this.undoStack.push(this._batchCommands);
      this._batchCommands = [];
      this.emit('history');
    }
  }

  // 不支持嵌套调用
  startBatch() {
    if (!this._isBatching) {
      this._isBatching = true;
      this.emit('history');
    }
  }

  stopBatch() {
    if (this._isBatching) {
      this._isBatching = false;
      this._flushBatchCommands();
      this.emit('history');
    }
  }

  abortBatch() {
    if (this._isBatching) {
      this._isBatching = false;
      this._batchCommands = [];
      this.emit('history');
    }
  }
}
