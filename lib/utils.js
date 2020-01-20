const path = require('path');
/**
* Miscellaneous utility functions for use throughout the application
*/
class Utils {
  /**
  * Capitalises the passed string
  * @param {String} s String to capitalise
  * @return {String} Capitalised string
  */
  static capitalise(s) {
    if(!this.isString(s)) return s;
    return `${s[0].toUpperCase()}${s.slice(1)}`;
  }
  static pluralise(s) {
    if(!this.isString(s)) return s;
    return `${s}s`;
  }
  /**
  * Returns the path used when requiring a module. Should be used rather than assuming any structure (e.g. ./node_modules/moduleName).
  * @param {String} moduleName
  * @return {String} The resolved path
  */
  static getModuleDir(moduleName) {
    if(moduleName) {
      return path.dirname(require.resolve(moduleName));
    }
    return path.resolve(require.resolve('adapt-authoring-core'), '..', '..');
  }
  /**
  * Removes any 'undefined' properties from a given object (in-place)
  * @param {Object} target The target object to modify
  * @param {Boolean} recursive Whether the function should check nested objects
  * @return {Object} The modified object
  */
  static trimUndefinedValues(target, recursive = true) {
    Object.entries(target).forEach(([k,v]) => {
      if(v && typeof v === 'object') return this.trimUndefinedValues(v, recursive);
      if(v === undefined) delete target[k];
    });
    return target;
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
  * Checks if a target is a number.
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }
  /**
  * Checks if a target is an object.
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isObject(value) {
    return typeof value === 'object';
  }
  /**
  * Checks if a target is a promise.
  * @desc Naive check, but specifying a 'then' function is the only standard we can assume
  * @see https://promisesaplus.com/
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isPromise(value) {
    return this.isFunction(value && value.then);
  }
  /**
  * Checks if a target is a string.
  * @param {*} value Value to check
  * @return {Boolean}
  */
  static isString(value) {
    return typeof value === 'string' || value instanceof String;
  }
}

module.exports = Utils;
