const Logger = require('adapt-authoring-logger');
/**
* Allows observers to tap into to a specific piece of code, and execute their own arbitrary code
*/
class Hook {
  /**
  * @constructor
  */
  constructor(opts) {
    /** @ignore */ this._observers = [];
    /** @ignore */ this._options = Object.assign({ type: 'parallel', mutable: false }, opts);
  }
  /**
  * Adds an observer to the hook
  * @param {Function} observer Callback to be called when the hook is invoked
  */
  tap(observer) {
    if(typeof observer === 'function') observers.push(observer);
  }
  /**
  * Invokes all observers
  * @param {Object} data Data to be passed to the observers
  * @return {Promise}
  */
  async invoke(data) {
    if(this._options.type === 'series') {
      for(let o of this._observers) {
        const modified = await o(data);
        if(typeof modified !== 'undefined') data = modified;
      }
      return data;
    }
    return Promise.all(this._observers.map(o => o(data)));
  }
}
/**
 * Class to allow other objects to hook into and call functions on specific actions
 */
class Hooks {
  /**
  * @constructor
  */
  constructor(...hooks) {
    /**
    * @type {Object}
    * @desc Contains all hooks
    */
    this.hooks = {};
    hooks.forEach(this.createHook);
  }
  /**
  * Creates a new hook
  * @param {Object} options
  */
  createHook(options) {
    if(typeof options === 'string') {
      options = { name: options };
    }
    if(!options.name) {
      return Logger.log('warn', 'Hooks', 'must specify name of hook');
    }
    if(!this.hooks[options.name]) {
      return Logger.log('warn', 'Hooks', `name '${options.name}' cannot be used`);
    }
    this.hooks[options.name] = new Hook(options);
  }
}

module.exports = Hooks;
