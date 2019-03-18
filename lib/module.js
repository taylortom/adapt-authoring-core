const Events = require('./events');
const Hookable = require('./hookable');
const Loadable = require('./loadable');
const Logger = require('adapt-authoring-logger');
const Utils = require('./utils');

/**
 * Abstract class for authoring tool modules
 * @implements {Hookable}
 * @implements {Loadable}
 * @implements {Events}
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

  log(level, ...rest) {
    Logger.log(level, `${Logger.emph(this.name.replace(/^adapt-authoring-/, ''))}`, ...rest);
  }
}

module.exports = Utils.compose(Module, Hookable, Loadable, Events);
