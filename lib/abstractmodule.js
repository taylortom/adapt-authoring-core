const Events = require('./events');
const Utils = require('./utils');
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
  *
  * @emits {ready}
  * @return {Promise}
  */
  async onReady() {
    if(this._isReady) return this;
    return new Promise((resolve) => this.once('ready', () => resolve(this)));
  }
  /**
  *
  * @emits {ready}
  * @return {Promise}
  */
  setReady() {
    this._isReady = true;
    this.emit('ready', this);
    this.constructor.emit('ready', this.name, this);
    // can't rely on all core APIs being loaded, so skip
    if(!this.pkg.coreApiName) this.log('debug', this.t('info.ready'));
  }
  /**
  * Shortcut for retrieving config values
  * @param {String} key
  * @return {*}
  */
  getConfig(key) {
    return this.app.config.get(`${this.name}.${key}`);
  }
  /**
  * Shortcut for translating language strings
  * @param {String} key Key to be passed to the translation utility
  * @param {*} data Data to be passed to the translation utility
  * @return {String} The translated string
  */
  t(key, data) {
    return this.app.lang.t(key, data);
  }
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...Object} rest Arguments to log
  */
  async log(level, ...rest) {
    const args = [level, this.name.replace(/^adapt-authoring-/, ''), ...rest];
    try {
      (await this.app.waitForModule('logger')).log(...args);
    } catch(e) {
      console.log(...args);
    }
  }
}

module.exports = AbstractModule;
