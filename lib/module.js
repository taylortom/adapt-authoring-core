const Events = require('./events');
const Hooks = require('./hooks');
const Loadable = require('./loadable');
const Logger = require('adapt-authoring-logger');
const Utils = require('./utils');
/**
 * Abstract class for authoring tool modules
 */
class Module extends Loadable {
  /**
  * @constructor
  * @param {Object} app Reference to the main application
  * @param {Object} config Config object from package.json for this module
  */
  constructor(app, config) {
    super(app, config);
    Utils.defineGetter(this, {
      app: app,
      pkgConfig: config,
      name: config && config.name || this.constructor.name
    });
  }
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...Object} rest Arguments to log
  */
  log(level, ...rest) {
    Logger.log(level, `${Logger.emph(this.name.replace(/^adapt-authoring-/, ''))}`, ...rest);
  }
}

module.exports = Module;
