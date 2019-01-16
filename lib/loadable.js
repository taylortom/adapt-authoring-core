const Logger = require('adapt-authoring-logger');
const Utils = require('./utils');

let hasPreloaded = false;
let hasBooted = false;

const Loadable = superclass => class extends superclass {
  constructor(...args) {
    super(...args);

    this.createHook('preload');
    this.createHook('boot');

    this.hooks.preload.tap(() => {
      this.constructor.emit('preload', this.name);
      this.emit('preload');
    });
    this.hooks.boot.tap(() => {
      this.constructor.emit('boot', this.name);
      this.emit('boot');
    });
  }

  get hasPreloaded() {
    return hasPreloaded;
  }
  get hasBooted() {
    return hasBooted;
  }
  /**
  * Preloads the module. Acts as a wrapper function to preload.
  * @param {Object} app reference to the main app
  * @return {Promise}
  */
  preload(app, resolve, reject) {
    resolve();
  }
  /**
  * Boots the module. Acts as a wrapper function to boot.
  * @param {Object} app reference to the main app
  * @return {Promise}
  */
  preloadDelegate(app) {
    return new Promise((resolve, reject) => {
      this.preload(app, resolve, reject);
    }).then(() => {
      hasPreloaded = true;
      this.hooks.preload.invoke();
    });
  }
  /**
  * Boots the module. Acts as a wrapper function to boot.
  * @param {Object} app reference to the main app
  * @return {Promise}
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
      this.boot(app, resolve, reject);
    }).then(() => {
      hasBooted = true;
      this.hooks.boot.invoke();
    });
  }
}

module.exports = Loadable;
