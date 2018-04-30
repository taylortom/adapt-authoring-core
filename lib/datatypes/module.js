const EventEmitter = require('events');

/**
 * Abstract class for authoring tool modules
 * @constructor
 */
class Module extends EventEmitter {
  constructor(app) {
    super();
    // store a reference to an arbitrary 'app' instance
    const __app = app;
    Object.defineProperty(this, 'app', { get: function() { return __app; } });
  }

  get name() {
    return this.constructor.name;
  }
  // returns a 'key-friendly' version of the name (just makes first char lowercase)
  get instanceKey() {
    const name = this.name;
    return `${name[0].toLowerCase() + name.slice(1)}`;
  }

  /**
  * Function to call any actions required to preload the module.
  * Will be passed as a promise executor to preloadDelegate
  * @param resolve resolves the promise
  * @param reject rejects the promise
  */
  preload(resolve, reject) {
    resolve();
  }
  preloadDelegate() {
    return new Promise(this.preload.bind(this)).then(() => {
      this.hasPreloaded = true;
      this.emit('preloaded');
    });
  }

  /**
  * Function to call any actions required to start the module.
  * Will be passed as a promise executor to preloadDelegate
  * @param resolve resolves the promise
  * @param reject rejects the promise
  */
  boot() {
  }
  bootDelegate() {
    return new Promise(this.boot.bind(this)).then(() => {
      this.hasBooted = true;
      this.emit('booted');
    });
  }
}

module.exports = Module;
