const Loadable = require('./loadable');
const Utils = require('./utils');
/**
 * Abstract class for authoring tool modules
 */
class Module extends Loadable {
  /**
  * Create the Module instance
  * @param {Object} app Reference to the main application
  * @param {Object} pkg Config object from package.json for this module
  */
  constructor(app, pkg) {
    super(app, pkg);
    /**
    * Reference to the main app instance
    * @type {App}
    */
    this.app = {};
    /**
    * Module config options
    * @type {Object}
    */
    this.pkg = {};
    /**
    * Name of the module
    * @type {String}
    */
    this.name = '';

    Utils.defineGetter(this, {
      app: app,
      pkg: pkg,
      name: pkg && pkg.name || this.constructor.name,
    });
  }
  /**
  * Shortcut for retrieving config values
  * @param {String} key
  * @return {*}
  */
  getConfig(key) {
    return this.app.config.get(`${this.name}.${key}`);
  }
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...Object} rest Arguments to log
  */
  log(level, ...rest) {
    const args = [level, this.name.replace(/^adapt-authoring-/, ''), ...rest];

    if(!this.app.logger || !this.app.logger.log) {
      return console.log(...args);
    }
    this.app.logger.log(...args);
  }
}

module.exports = Module;
