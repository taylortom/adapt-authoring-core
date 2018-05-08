const EventEmitter = require('events');

/**
 * Abstract class for authoring tool modules
 * @constructor
 */
class Module extends EventEmitter {
  get name() {
    return this.constructor.name;
  }

  /**
  * Function to call any actions required to preload the module.
  * Will be passed as a promise executor to preloadDelegate
  * @param {Object} app reference to the main app
  * @param {Function} resolve resolves the promise
  * @param {Function} reject rejects the promise
  */
  preload(app, resolve, reject) {
    resolve();
  }
  preloadDelegate(app) {
    return new Promise((resolve, reject) => {
      this.preload.call(this, app, resolve, reject);
    }).then(() => {
      this.hasPreloaded = true;
      this.emit('preloaded');
    });
  }

  /**
  * Function to call any actions required to start the module.
  * Will be passed as a promise executor to preloadDelegate
  * @param {Object} app reference to the main app
  * @param {Function} resolve resolves the promise
  * @param {Function} reject rejects the promise
  */
  boot(app, resolve, reject) {
    resolve();
  }
  bootDelegate(app) {
    return new Promise((resolve, reject) => {
      this.boot.call(this, app, resolve, reject);
    }).then(() => {
      this.hasBooted = true;
      this.emit('booted');
    });
  }
}

module.exports = Module;
