const Events = require('./events');
const Logger = require('adapt-authoring-logger');
const Utils = require('./utils');
/** @ignore */let hasPreloaded = false;
/** @ignore */ let hasBooted = false;
/**
* Makes a class loadable
*/
class Loadable extends Events {
  /**
  * Whether the class has completed its preload routine
  * @return {Boolean}
  */
  get hasPreloaded() {
    return hasPreloaded;
  }
  /**
  * Whether the class has completed its boot routine
  * @return {Boolean}
  */
  get hasBooted() {
    return hasBooted;
  }
  /**
  * The module preload routine. Should perform any asynchronous actions which are required prior to the module booting.
  * @param {Object} app reference to the main app
  * @param {Function} resolve Function to call on fulfilment
  * @param {Function} reject Function to call on rejection
  */
  preload(app, resolve, reject) {
    resolve();
  }
  /**
  * A wrapper function for the preload process, should not be overridden
  * @param {Object} app reference to the main app
  * @emits {preload}
  * @return {Promise}
  */
  preloadDelegate(app) {
    return new Promise((resolve, reject) => {
      this.preload(app, resolve, reject);
    }).then(() => {
      this.log('debug', 'preloaded');
      hasPreloaded = true;
      this.constructor.emit('preload', this.name);
      this.emit('preload');
    });
  }
  /**
  * The module boot routine. Should perform any asynchronous actions which are required to start the module.
  * @param {Object} app reference to the main app
  * @param {Function} resolve Function to call on fulfilment
  * @param {Function} reject Function to call on rejection
  */
  boot(app, resolve, reject) {
    resolve();
  }
  /**
  * A wrapper function for the boot process, should not be overridden
  * @param {Object} app reference to the main app
  * @emits {boot}
  * @return {Promise}
  */
  bootDelegate(app) {
    return new Promise((resolve, reject) => {
      this.boot(app, resolve, reject);
    }).then(() => {
      this.log('debug', 'booted');
      hasBooted = true;
      this.constructor.emit('boot', this.name);
      this.emit('boot');
    });
  }
}

module.exports = Loadable;
