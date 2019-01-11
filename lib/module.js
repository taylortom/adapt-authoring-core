const EventEmitter = require('events');

/**
 * Abstract class for authoring tool modules
 */
class Module {
  /**
  * @constructor
  * @param {Object} app Reference to the main application
  * @param {Object} config Config object from package.json for this module
  */
  constructor(app, config) {
    Utils.defineGetter(this, {
      app: app,
      pkgConfig: config,
      name: config && config.name || this.constructor.name
    });
  }
}

module.exports = Module;
