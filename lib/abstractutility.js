const Utils = require('./utils');
/**
 * Abstract class for authoring tool utilities. All custom utilities must extend this class.
 */
class AbstractUtility {
  /**
  * Create the Utility instance
  * @param {Object} app Reference to the main application
  * @param {Object} pkg Config object from package.json for this module
  */
  constructor(app, pkg) {
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
    const errors = [];
    /**
    * Errors thrown by the utility
    * @type {Array<UtilityError>}
    */
    this.errors = [];

    Utils.defineGetter(this, {
      app: app,
      pkg: pkg,
      name: pkg && pkg.name || this.constructor.name,
      errors: errors
    });

    try {
      const utilName = this.pkg.adapt_authoring.utility;
      this.app[utilName] = this;
    } catch(e) {
      this.handleError('error.registerutil');
    }
  }
  /**
  * Internally stores the passed error
  * @param {String} key Language key to be used for main error message
  * @param {Object} data Data to be stored alongside error
  * @param {String} type Type of error (error, warn)
  */
  handleError(key, data, type) {
    this.errors.push(new UtilityError(key, data, type));
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
/**
* Describes a utility error
*/
class UtilityError extends Error {
  /**
  * @constructor
  * @param {String} key Language key to be used for main error message
  * @param {Object} data Data to be stored alongside error
  * @param {String} type Type of error (error, warn)
  */
  constructor(key, data, type = 'error') {
    super();
    /**
    * Language key to be used for main error message
    * @type {String}
    */
    this.key = key;
    /**
    * Data associated with the error
    * @type {Object}
    */
    this.data = data;
    /**
    * Type of error
    * @type {String}
    */
    this.type = type;
  }
}

module.exports = AbstractUtility;
