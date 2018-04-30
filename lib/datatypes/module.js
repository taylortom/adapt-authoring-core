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

  /**
  * Function to call any actions required to preload the module.
  * The delegate function contains the real meat of the task
  * @return Promise
  */
  preload(app) {
    var p = new Promise(this.preloadDelegate.bind(this));
    p.then(() => { this.emit('preloaded'); });
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
    this.emit('booted');
    var p = new Promise(this.bootDelegate.bind(this));
    p.then(() => { this.emit('booted'); });
    return p;
  }
  bootDelegate(resolve, reject) {
    resolve();
  }
}

module.exports = Module;
