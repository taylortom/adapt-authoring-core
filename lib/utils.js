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
  * Checks if a target is an array.
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isArray(value) {
    return Array.isArray(value);
  }
  /**
  * Checks if a target is a boolean.
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isBoolean(value) {
    return typeof value === 'boolean';
  }
  /**
  * Checks if a target is a function.
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isFunction(value) {
    return typeof value === 'function';
  }
  /**
  * Checks if a target is a number .
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }
  /**
  * Checks if a target is a promise.
  * @desc Naive check, but specifying a 'then' function is the only standard we can assume
  * @see https://promisesaplus.com/
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isPromise(value) {
    return typeof value.then === 'function';
  }
  /**
  * Checks if a target is a string.
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isString(value) {
    return typeof value === 'string' || value instanceof String;
  }
  /**
  * Log a message using the Logger module
  * @param {Class} logger Log utility instance
  * @param {String} level Log level of message
  * @param {String} name Identifier for root of message
  * @param {...Object} rest Arguments to log
  */
  static logMessage(logger, level, name, ...rest) {
    const func = logger[level] || logger.info;
    func.call(logger, name, ...rest);
  }
}

module.exports = Utils;
