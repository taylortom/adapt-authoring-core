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
}

module.exports = Utils;
