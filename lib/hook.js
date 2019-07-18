/**
* Allows observers to tap into to a specific piece of code, and execute their own arbitrary code
*/
class Hook {
  static get Types() {
    return {
      Parallel: 'parallel',
      Series: 'series'
    };
  }
  /** @constructor */
  constructor(opts) {
    /** @ignore */ this._observers = [];
    /** @ignore */ this._options = Object.assign({ type: Hook.Types.Parallel, mutable: false }, opts);
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
  invoke(data) {
    if(this._options.type === Hook.Types.Parallel) {
      return Promise.all(this._observers.map(o => o(data)));
    }
    return new Promise(async (resolve, reject) => {
      for(let o of this._observers) {
        try {
          const modified = await o(data);
          if(typeof modified !== 'undefined') data = modified;
        } catch(e) {
          reject(e);
        }
      }
      resolve(data);
    });
  }
}

module.exports = Hook;
