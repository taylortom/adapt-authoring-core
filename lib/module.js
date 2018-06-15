const EventEmitter = require('events');

/**
 * Abstract class for authoring tool modules
 */
class Module extends EventEmitter {
  /**
  * @constructor
  * @param {Object} app Reference to the main application
  * @param {Object} config Config object from package.json for this module
  */
  constructor(app, config) {
    super();
    /**
    * Whether the Module has been preloaded
    * @type {Boolean}
    */
    this.hasPreloaded = false;
    /**
    * Whether the Module has been booted
    * @type {Boolean}
    */
    this.hasBooted = false;

    this.defineGetter('pkgConfig', config);
  }

  defineGetter(propName, value) {
    Object.defineProperty(this, propName, {
      get: () => { return value; }
    });
  }

  /**
  * Getter function to return module name (inferred from Class name)
  * @return {String} Name of module
  */
  get name() {
    return this.constructor.name;
  }

  /**
  * Function to call any actions required to preload the module. Will be passed as a promise executor to preloadDelegate
  * @param {Object} app reference to the main app
  * @param {Function} resolve resolves the promise
  * @param {Function} reject rejects the promise
  */
  preload(app, resolve, reject) {
    resolve();
  }
  /**
  * Preloads the module. Acts as a wrapper function to preload.
  * @param {Object} app reference to the main app
  * @return {Promise}
  */
  preloadDelegate(app) {
    return new Promise((resolve, reject) => {
      this.preload.call(this, app, resolve, reject);
    }).then(() => {
      this.hasPreloaded = true;
      this.emit('preloaded');
    });
  }

  /**
  * Function to call any actions required to start the module. Will be passed as a promise executor to preloadDelegate
  * @param {Object} app reference to the main app
  * @param {Function} resolve resolves the promise
  * @param {Function} reject rejects the promise
  */
  boot(app, resolve, reject) {
    resolve();
  }
  /**
  * Boots the module. Acts as a wrapper function to boot.
  * @param {Object} app reference to the main app
  * @return {Promise}
  */
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
