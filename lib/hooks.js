const Logger = require('adapt-authoring-logger');
/**
 * A Hook
 * @typedef {Function} Hook
 * @type {Object}
 * @type {Function} tap gfjghklfdjkl
 */
const Hook = opts => {
  const observers = [];
  const options = Object.assign({ type: 'parallel', mutable: false }, opts);

  return {
    /**
     * Add an observer to the Hook instance
     * @type {Function}
     * @param {Object}
     */
    tap: (o) => {
      if(typeof o === 'function') observers.push(o);
    },
    invoke: async (data) => {
      if(options.type === 'series') {
        for(let o of observers) {
          const modified = await o(data);
          if(typeof modified !== 'undefined') data = modified;
        }
        return data;
      }
      return Promise.all(observers.map(o => o(data)));
    }
  };
}
/**
 * Class to allow other objects to hook into and call functions on specific actions
 */
class Hooks {
  constructor(...hooks) {
    this.hooks = {};
    hooks.forEach(this.createHook);
  }
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
    this.hooks[options.name] = Hook(options);
  }
}

module.exports = Hooks;
