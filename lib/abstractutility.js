const Utils = require('./utils');
/**
 * Abstract class for authoring tool modules
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
    /**
    * Errors thrown by the utility
    * @type {Array<UtilityError>}
    */
    const errors = [];
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

  handleError(key, data, type) {
    this.errors.push(new UtilityError(key, data, type));
  }
}
/**
* Handles utility errors
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
    this.key = key;
    this.data = data;
    this.type = type;
  }
}

module.exports = AbstractUtility;
