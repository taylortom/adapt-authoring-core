const EventEmitter = require('events');

/**
 * Abstract class for authoring tool modules
 * @constructor
 */
class Module extends EventEmitter {
  constructor(app) {
    super();
    // store a reference to an arbitrary 'app' instance
    const __app = app;
    Object.defineProperty(this, 'app', { get: function() { return __app; } });
  }

  get name() {
    return this.constructor.name;
  }
  // returns a 'key-friendly' version of the name (just makes first char lowercase)
  get instanceKey() {
    const name = this.name;
    return `${name[0].toLowerCase() + name.slice(1)}`;
  }

  /**
  * Function to call any actions required to preload the module.
  * The delegate function contains the real meat of the task
  * @return Promise
  */
  preload() {
    var p = new Promise(this.preloadDelegate.bind(this));
    p.then(() => {
      this.hasPreloaded = true;
      this.emit('preloaded');
    });
    return p;
  }
  preloadDelegate(resolve, reject) {
    resolve();
  }

  /**
  * Function to call any actions required to start the module
  * The delegate function contains the real meat of the task
  * @return Promise
  */
  boot() {
    var p = new Promise(this.bootDelegate.bind(this));
    p.then(() => {
      this.hasBooted = true;
      this.emit('booted');
    });
    return p;
  }
  bootDelegate(resolve, reject) {
    resolve();
  }
}

module.exports = Module;
