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
  * The singleton instance (initialises it if there isn't one)
  * @type {App}
  */
  static get instance() {
    if(!instance) instance = new App();
    return instance;
  }
  /**
  * Create the application instance
  */
  constructor() {
    const adaptJson = require(path.join(process.cwd(), 'adapt.json'));
    const packageJson = require(path.join(process.cwd(), 'package.json'));
    super(null, { ...packageJson, ...adaptJson, name: 'app', dir: path.join(__dirname, '..') });
    /**
    * Instance of App instance (required by all AbstractModules)
    * @type {App}
    */
    this.app = this;
    /**
    * Reference to the DependencyLoader instance
    * @type {DependencyLoader}
    */
    this.dependencyloader = new DependencyLoader(this);

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
      this.checkEssentialApis();
      this.setReady();
      this.log('success', this.t('info.startapp', { dir: this.getConfig('root_dir') }));
    } catch(e) {
      await this.log('error', e.message);
      if(e.data && e.data.errors) e.data.errors.forEach(e => this.log('error', e));
      process.exit(1);
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
  checkEssentialApis() {
    const apis = this.pkg.essentialApis;
    if(!apis) {
      return;
    }
    const errors = apis.filter(d => !this[d]);
    if(errors.length) {
      throw new Error(`Missing essential api${errors.length > 1 ? 's' : ''}: ${errors.join(', ')}`);
    }
  }
  /** @override */
  setReady() {
    this._isStarting = false;
    super.setReady();
  }
}

module.exports = App;
