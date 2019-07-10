const Loadable = require('./loadable');
const Utils = require('./utils');
/**
 * Abstract class for authoring tool modules
 */
class Module extends Loadable {
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...Object} rest Arguments to log
  */
  static log(level, ...rest) {
    const name = this.name[0].toUpperCase() + this.name.replace(/^adapt-authoring-/, '').slice(1);
    __log(level, name, ...rest);
  }
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
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...Object} rest Arguments to log
  */
  log(level, ...rest) {
    __log(level, this.name.replace(/^adapt-authoring-/, ''), ...rest);
  }
}

function __log(level, name, ...rest) {
  Utils.logMessage(level, name, ...rest);
}

module.exports = Module;
