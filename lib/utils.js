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
  /**
  * Gives read-only access to a variable. Accepts either key/value, or object specifying multiple keys/values
  * @param {Object} scope
  * @param {String|Object} propName
  * @param {*} value
  * @example
  * // single key/value
  * Utils.defineGetter(this, 'test', true);
  * // multiple key/value pairs
  * Utils.defineGetter(this, {
  *   test: true,
  *   anotherTest: true
  * });
  */
  static defineGetter(scope, propName, value) {
    const _f = (p,v) => Object.defineProperty(scope, p, { get: () => v });

    if(typeof propName !== 'object') {
      _f(propName, value);
    }
    else {
      Object.entries(propName).forEach(([p,v]) => _f(p,v));
    }
    return scope;
  }
  /**
  * Accepts either key/setter function, or object specifying multiple keys/setter functions
  * @param {Object} scope
  * @param {String} propName
  * @param {Function} setter
  */
  static defineSetter(scope, propName, setter) {
    const _f = (p,s) => Object.defineProperty(scope, p, { set: s });

    if(typeof propName !== 'object') {
      _f(propName, setter);
    }
    else {
      Object.entries(propName).forEach(([p,s]) => _f(p,s));
    }
    return scope;
  }
  /**
  * Object.assigns nested values, creating nested objects where necessary
  * @param {...*} args
  */
  static safeAssign(...args) {
    const base = args.shift();
    const val = args.pop();
    let parent = base;
    let i = 0;

    args.forEach(a => {
      if(!this.isString(a)) {
        throw new Error(`Expected string, ${typeof a}`);
      }
      if(!parent[a]) {
        parent[a] = {};
      }
      parent = parent[a];
    });
    Object.assign(parent, val);
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
