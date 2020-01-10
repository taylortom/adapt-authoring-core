const DataValidationError = require('./datavalidationerror');
const DependencyLoader = require('./dependencyloader');
const AbstractModule = require('./abstractmodule');
const path = require('path');
const Utils = require('./utils');

let instance;
// /** @ignore */ let initialising = false;
/**
* The main application class
*/
class App extends AbstractModule {
  /**
  * Returns the singleton instance, or initialises it if there isn't one
  * @return {App} The instance
  */
  static get instance() {
    if(!instance) instance = new App();
    return instance;
  }
  /**
  * Create the application instance
  */
  constructor() {
    const pkg = require(path.join(process.cwd(), 'package.json'));
    super(null, { ...pkg, name: 'app', dir: path.join(__dirname, '..') });
    /**
    * Instance of App instance (i.e. this...required by AbstractModules)
    * @type {App}
    */
    this.app = this;
    /**
    * Reference to the DependencyLoader instance
    * @type {DependencyLoader}
    */
    this.dependencyloader = new DependencyLoader(this);
    /**
    * Module for handling system configuration storage
    * @type {Object}
    */
    this.config = {};
    /**
    * Module for translating strings
    * @type {Object}
    */
    this.lang = {};
    /**
    * Module for logging messages
    * @type {Object}
    */
    this.logger = {};

    /** @ignore */ this._isStarting = false;
    this.start();
  }
  /**
  * The module dependencies
  * @return {Object}
  */
  get dependencies() {
    return this.dependencyloader.dependencies;
  }
  /** @override */
  getConfig(key) {
    return this.app.config.get(`adapt-authoring-core.${key}`);
  }
  /**
  * Starts the app
  * @return {Promise} Resolves when the app has started
  */
  async start() {
    if(this._isStarting) { // don't try to start multiple times
      return;
    }
    this._isStarting = true;
    try {
      await this.dependencyloader.load();
      this.setReady();
      this.log('success', this.t('info.startapp', { dir: this.getConfig('root_dir') }));
    } catch(e) {
      this.log('error', e);
      if(e.data && e.data.errors) e.data.errors.forEach(e => this.log('error', e));
    }
  }
  /**
  * Retrieves a loaded module instance
  * @param {String} modName The module to retrieve
  * @return {AbstractModule}
  */
  getModule(modName) {
    return this.dependencyloader.getModuleInstance(modName);
  }
  /**
  * Enables waiting for other modules to load
  * @param {...String} modNames Names of modules to wait for
  * @return {Promise} Resolves when specified module has been loaded
  */
  async waitForModule(...modNames) {
    const results = await Promise.allSettled(modNames.map(m => this.dependencyloader.waitForModule(m)));
    if(modNames.length === 1) {
      return results[0].value || undefined;
    }
    return results.map(r => (r.status === 'fulfilled' && r.value) || undefined);
  }
  /** @override */
  setReady() {
    this._isStarting = false;
    super.setReady();
  }
}

module.exports = App;
