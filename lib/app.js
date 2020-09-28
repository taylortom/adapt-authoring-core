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
    const adaptJson = require(path.join(process.cwd(), Utils.metadataFileName));
    const packageJson = Utils.requirePackage();
    super(null, { ...packageJson, ...adaptJson, name: 'adapt-authoring-core', dir: path.join(__dirname, '..') });
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
   * The Adapt module dependencies and their configs
   * @type {Object}
   */
  get dependencies() {
    return this.dependencyloader.configs;
  }
  /**
   * Starts the app
   * @return {Promise} Resolves when the app has started
   */
  async start() {
    if(this._isStarting) {
      throw new Error('App is already initialising');
    } else if(this._isReady) {
      throw new Error('App already started');
    }
    this._isStarting = true;
    try {
      await this.dependencyloader.load();
      this.checkEssentialApis();
    } catch(e) {
      await this.log('error', e.message);
      if(e.data && e.data.errors) e.data.errors.forEach(e2 => this.log('error', e2));
      process.exit(1);
    }
    this._isStarting = false;
    this.setReady();
    this.log('success', `running application from ${this.getConfig('rootDir')}`);
  }
  /**
   * Enables waiting for other modules to load
   * @param {...String} modNames Names of modules to wait for
   * @return {Promise} Resolves when specified module has been loaded
   */
  async waitForModule(...modNames) {
    const results = await Promise.all(modNames.map(m => this.dependencyloader.waitForModule(m)));
    return results.length > 1 ? results : results[0];
  }
  /**
   * Checks that all APIs marked as essential have a module which implements them installed
   */
  checkEssentialApis() {
    const apis = this.pkg.essentialApis;
    if(!apis) {
      return;
    }
    const errors = apis.filter(d => !this[d]);
    if(errors.length) {
      throw new Error(`Missing essential api${errors.length > 1 ? 's' : ''}: ${errors.join(', ')}\nThese must be installed for the app to run correctly.`);
    }
  }
  /** @override */
  setReady() {
    this._isStarting = false;
    super.setReady();
  }
}

module.exports = App;
