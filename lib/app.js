const DataValidationError = require('./datavalidationerror');
const DependencyLoader = require('./dependencyloader');
const AbstractModule = require('./abstractmodule');
const path = require('path');
const Utils = require('./utils');

let instance;
/** @ignore */ let initialising = false;
/**
* The main application class
*/
class App extends AbstractModule {
  /**
  * Returns the singleton instance, or initialises it if there isn't one
  * @return {App} The instance
  */
  static get instance() {
    if(initialising) {
      return; // don't initialise if we're already initialising
    }
    if(!instance) {
      initialising = true;
      instance = new App();
      initialising = false;
    }
    return instance;
  }
  /**
  * Create the application instance
  */
  constructor() {
    const pkg = require(path.join(process.cwd(), 'package.json'));
    super(null, Object.assign(pkg, { name: 'app', dir: path.join(__dirname, '..') }));
    // must have the App reference for parent class, and can't pass 'this' to
    // the super constructor because it doesn't exist yet
    Utils.defineGetter(this, 'app', this);
    /**
    * Module for handling system configuration storage
    * @type {AbstractConfig}
    */
    this.config = {};
    /**
    * Module for translating strings
    * @type {AbstractLang}
    */
    this.lang = {};
    /**
    * Module for logging messages
    * @type {AbstractLogger}
    */
    this.logger = {};

    this.initialiseDependencies();
  }
  /**
  * Creates all app dependencies
  */
  initialiseDependencies() {
    const errors = [];
    /**
    * Reference to the DependencyLoader instance
    * @type {DependencyLoader}
    */
    this.dependencyloader = new DependencyLoader({ ...this.pkg.dependencies, ...this.pkg.devDependencies }, this);
    this.dependencyloader.on('error', e => errors.push(e));
    this.dependencyloader.configure();
    this.dependencyloader.initialiseUtilities(['lang', 'config', 'logger', 'auth']);
    this.dependencyloader.initialiseModules();
    // cache utility instances
    const utilities = Object.entries(this.dependencyloader.utilities);
    utilities.forEach(([type, instance]) => this[type] = instance);

    if(!errors.length) {
      return;
    }
    errors.forEach(e => {
      if(this.lang && this.lang.t) this.log(e.type, this.lang.t(e.key, e.data));
      else console.log(e.data || e);
    });
    process.exit(1);
  }
  /**
  * The module dependencies
  * @return {Object}
  */
  get dependencies() {
    return this.dependencyloader.dependencies;
  }
  /**
  * Retrieves a loaded module by name (shortcut for {@link DependencyLoader#getModule})
  * @param {String} name
  * @return {AbstractModule} module instance
  */
  getModule(name) {
    return this.dependencyloader.getModule(name);
  }
  /** @override */
  getConfig(key) {
    return this.app.config.get(`adapt-authoring-core.${key}`);
  }
  /**
  * Starts the app
  */
  async start() {
    try {
      await this.dependencyloader.preloadModules();
      await this.dependencyloader.bootModules();
      this.log('success', this.lang.t('info.startapp', { dir: this.getConfig('root_dir') }));
    } catch(e) {
      const data = {
        name: e.data.module,
        error: e.data.error.message,
        stack: e.stack
      };
      this.log('error', `${this.lang.t(`error.${e.key}`, data)}`);
    }
  }
}

module.exports = App;
