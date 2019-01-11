const logger = require('adapt-authoring-logger');
/**
 * Class to allow other objects to hook into and call functions on specific actions
 */
const Hook = opts => {
  const observers = [];
  const options = Object.assign({ type: 'parallel', mutable: false }, opts);

  return {
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

const Hookable = superclass => class extends superclass {
  constructor(...args) {
    super(...args);
    this.hooks = {};
  }
  createHook(options) {
    if(typeof options === 'string') {
      options = { name: options };
    }
    if(!options.name) {
      return logger.log('warn', 'Hookable#createHook: need to specify name of hook');
    }
    this.hooks[options.name] = Hook(options);
  }
};

module.exports = Hookable;
