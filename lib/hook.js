const Logger = require('adapt-authoring-logger');
/**
* Allows observers to tap into to a specific piece of code, and execute their own arbitrary code
*/
class Hook {
  /** @constructor */
  constructor(opts) {
    /** @ignore */ this._observers = [];
    /** @ignore */ this._options = Object.assign({ type: 'parallel', mutable: false }, opts);
  }
  /**
  * Adds an observer to the hook
  * @param {Function} observer Callback to be called when the hook is invoked
  */
  tap(observer) {
    if(typeof observer === 'function') this._observers.push(observer);
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

module.exports = Hook;
