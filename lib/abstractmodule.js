const Events = require('./events');
/**
 * Abstract class for authoring tool modules. All custom modules must extend this class.
 */
class AbstractModule extends Events {
  /**
  * Create the Module instance
  * @param {Object} app Reference to the main application
  * @param {Object} pkg Config object from package.json for this module
  */
  constructor(app, pkg) {
    super(app, pkg);
    /**
    * Reference to the main app instance
    * @type {App}
    */
    this.app = app;
    /**
    * Module config options
    * @type {Object}
    */
    this.pkg = pkg;
    /**
    * Name of the module
    * @type {String}
    */
    this.name = pkg && pkg.name || this.constructor.name;
    /** @ignore */
    this._isReady = false;
  }
  /**
  * Used to listen to the module's ready signal
  * @return {Promise}
  */
  async onReady() {
    if(this._isReady) return this;
    return new Promise((resolve) => this.once('ready', () => resolve(this)));
  }
  /**
  * Signals that the module is loaded
  * @emits {ready}
  * @return {Promise}
  */
  setReady() {
    this._isReady = true;
    this.emit('ready', this);
    this.constructor.emit('ready', this.name, this);
    this.log('debug', 'ready');
  }
  /**
  * Shortcut for retrieving config values
  * @param {String} key
  * @return {*}
  */
  getConfig(key) {
    try {
      return this.app.config.get(`${this.name}.${key}`);
    } catch(e) {
      return undefined;
    }
  }
  /**
  * Shortcut for translating language strings
  * @param {String} key Key to be passed to the translation utility
  * @param {Object} data Data to be passed to the translation utility
  * @return {String} The translated string
  */
  t(key, data) {
    try {
      return this.app.lang.t(key, data);
    } catch(e) {
      return JSON.stringify(Object.assign(data, { key }));
    }
  }
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...*} rest Arguments to log
  * @return {Promise}
  */
  async log(level, ...rest) {
    const args = [level, this.name.replace(/^adapt-authoring-/, ''), ...rest];
    const log = async () => {
      await this.app.logger.onReady();
      this.app.logger.log(...args);
    };
    if(this.app.logger) {
      return log();
    }
    const o = () => {
      if(this.app.logger) {
        this.app.dependencyloader.off('moduleloaded', o);
        log();
      }
    };
    this.app.dependencyloader.on('moduleloaded', o);
  }
}

module.exports = AbstractModule;
