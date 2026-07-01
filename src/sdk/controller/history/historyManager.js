import { EVENT } from '../../event';
import { AddCommand } from './addCommand';
import { RemoveCommand } from './removeCommand';
import { SortItemCommand } from './sortItemCommand';
import { ToggleMaskPlayerCommand } from './toggleMaskPlayerCommand';
import { UpdateCommand } from './updateCommand';

export class HistoryManager {
  constructor(mapEditor) {
    this.mapEditor = mapEditor;
    this.mapContainer = mapEditor.model;
    // this.maxUndoTimes = 100;
    this.undoStack = [];
    this.redoStack = [];
    this._isBatching = false;
    this._batchCommands = [];
    this._lastCommandTime = null;
    this._isBusy = false;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const handleAdd = ({ item }) => {
      // 在执行 undo/redo 的过程中不响应来自 model 的事件，避免发生循环调用
      if (this._isBusy) return;
  
      const command = new AddCommand(this.mapContainer, item);
      this._pushCommand(command);
    };

    const handleRemove = ({ item }) => {
      if (this._isBusy) return;
  
      const command = new RemoveCommand(this.mapContainer, item);
      this._pushCommand(command);
    };

    const handleUpdate = ({ item, changes }) => {
      if (this._isBusy) return;

      const command = new UpdateCommand(item, changes);
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

    this.mapContainer.on(EVENT.add, handleAdd);
    this.mapContainer.on(EVENT.remove, handleRemove);
    this.mapContainer.on(EVENT.update, handleUpdate);
    this.mapContainer.on(EVENT.sortItem, handleSortItem);
    this.mapContainer.on(EVENT.toggleMaskPlayer, handleToggleMaskPlayer);

    return () => {
      this.mapContainer.off(EVENT.add, handleAdd);
      this.mapContainer.off(EVENT.remove, handleRemove);
      this.mapContainer.off(EVENT.update, handleUpdate);
      this.mapContainer.off(EVENT.sortItem, handleSortItem);
      this.mapContainer.off(EVENT.toggleMaskPlayer, handleToggleMaskPlayer);
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
    this.mapEditor.emit(EVENT.history);
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
    this.mapEditor.emit(EVENT.history);
  }

  _pushCommand(command) {
    const currentStack = this._isBatching ? this._batchCommands : this.undoStack;
    currentStack.push(command);
  }

  _flushBatchCommands() {
    if (this._batchCommands.length > 0) {
      this.redoStack = [];
      this.undoStack.push(this._batchCommands);
      this._batchCommands = [];
      this.mapEditor.emit(EVENT.history);
    }
  }

  // 不支持嵌套调用
  startBatch() {
    if (!this._isBatching) {
      this._isBatching = true;
      this.mapEditor.emit(EVENT.history);
    }
  }

  stopBatch() {
    if (this._isBatching) {
      this._isBatching = false;
      this._flushBatchCommands();
      this.mapEditor.emit(EVENT.history);
    }
  }

  abortBatch() {
    if (this._isBatching) {
      this._isBatching = false;
      this._batchCommands = [];
      this.mapEditor.emit(EVENT.history);
    }
  }
}
