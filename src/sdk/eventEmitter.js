import mitt from "mitt";

export class EventEmitter {
  constructor() {
    this.emitter = mitt();
  }

  on(type, handler) {
    this.emitter.on(type, handler);
  }

  off(type, handler) {
    this.emitter.off(type, handler);
  }

  clear() {
    this.emitter.all.clear();
  }

  emit(type, event) {
    this.emitter.emit(type, event);
  }
}
