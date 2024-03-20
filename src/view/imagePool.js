import { fetchImage } from "../utils";

class ImagePool {
  constructor() {
    this.imgElems = new Map();
    this.pendingPromises = new Map();
  }

  get(url) {
    return this.imgElems.get(url);
  }

  load(url) {
    if (this.pendingPromises.has(url)) {
      return this.pendingPromises.get(url);
    }

    const promise = fetchImage(url);
    this.pendingPromises.set(url, promise);
    promise.then((elem) => {
      this.imgElems.set(url, elem);
      this.pendingPromises.delete(url);
    }, (err) => {
      console.error(`ImagePool: Fail to load ${url}`, err);
      this.pendingPromises.delete(url);
    });
    return promise;
  }

  clear() {
    this.imgElems.clear();
  }
}

export const imagePool = new ImagePool();
