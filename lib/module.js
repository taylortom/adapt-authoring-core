const Loadable = require('./loadable');
const Utils = require('./utils');
/**
 * Abstract class for authoring tool modules
 */
class Module extends Loadable {
  /**
  * Create the Module instance
  * @param {Object} app Reference to the main application
  * @param {Object} config Config object from package.json for this module
  */
  constructor(app, config) {
    super(app, config);
    /**
    * Reference to the main app instance
    * @type {App}
    */
    this.app = {};
    /**
    * Module config options
    * @type {Object}
    */
    this.config = {};
    /**
    * Name of the module
    * @type {String}
    */
    this.name = '';

    Utils.defineGetter(this, {
      app: app,
      config: config,
      name: config && config.name || this.constructor.name,
    });
  }
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...Object} rest Arguments to log
  */
  log(level, ...rest) {
    Utils.logMessage(level, this.name.replace(/^adapt-authoring-/, ''), ...rest);
  }
}

module.exports = Module;
