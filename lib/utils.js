class Utils = {
  // TODO need to be able to compose mixin functions as well as classes
  static compose: (base, ...mixins) => {
    mixins.forEach(m => base = m(base));
    return base;
  }
  /**
  * Accepts either key value, or object specifying multiple keys/values
  */
  static defineGetter: (scope, propName, value) => {
    const _f = (scope, propName, value) => Object.defineProperty(scope, propName, { get: () => value });
    if(typeof propName !== 'object') {
      _f(scope, propName, value);
      return scope;
    }
    Object.keys(propName).forEach(key => _f(scope, key, propName[key]));

    return scope;
  }
  /**
  * Type checking
  */
  /**
  * Naive, but specifying a 'then' function is the only standard we can assume
  * @see https://promisesaplus.com/
  */
  static isPromise: target => typeof target.then === 'function'
};

module.exports = Utils;
