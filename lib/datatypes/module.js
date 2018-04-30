const EventEmitter = require('events');

/**
 * Abstract class for authoring tool modules
 * @constructor
 */
class Module extends EventEmitter {
  /**
  * Function to call any actions required to preload the module.
  * The delegate function contains the real meat of the task
  * @return Promise
  */
  preload(app) {
    // store a reference to an arbitrary 'app' instance
    this.__app = app;
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

  get app() {
    return this.__app;
  }
}

module.exports = Module;
