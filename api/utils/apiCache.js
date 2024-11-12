export default class APICache {
    constructor() {
      this.cache = new Map();
      this.expiryTime = 24 * 60 * 60 * 1000; // 24 hours
    }
  
    get(key) {
      const item = this.cache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }
      return item.data;
    }
  
    set(key, data) {
      this.cache.set(key, {
        data,
        expiry: Date.now() + this.expiryTime
      });
    }
  }