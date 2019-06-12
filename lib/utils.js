const Logger = require('adapt-authoring-logger');
/**
* A group of utility functions
*/
class Utils {
  /**
  * Accepts either key value, or object specifying multiple keys/values
  * @param {Object} scope
  * @param {String} propName
  * @param {*} value
  */
  static defineGetter(scope, propName, value) {
    const _f = (scope, propName, value) => Object.defineProperty(scope, propName, { get: () => value });
    if(typeof propName !== 'object') {
      _f(scope, propName, value);
      return scope;
    }
    Object.keys(propName).forEach(key => _f(scope, key, propName[key]));

    return scope;
  }
  /**
  * Checks if a target is a Promise.
  * @desc Naive check, but specifying a 'then' function is the only standard we can assume
  * @see https://promisesaplus.com/
  * @param {Promise} target Target to check
  * @return {Boolean}
  */
  static isPromise(target) {
    typeof target.then === 'function'
  }
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {String} name Identifier for root of message
  * @param {...Object} rest Arguments to log
  */
  static logMessage(level, name, ...rest) {
    const func = Logger[level] || Logger.info;
    func.call(Logger, name, ...rest);
  }
}

module.exports = Utils;
