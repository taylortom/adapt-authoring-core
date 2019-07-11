const DependencyLoader = require('./dependencyloader');
const Module = require('./module');
const path = require('path');
const Utils = require('./utils');

let instance;
/**
* The main application class
*/
class App extends Module {
  /**
  * Returns the singleton instance, or initialises it if there isn't one
  * @return {App} The instance
  */
  static get instance() {
    if(!instance) {
      instance = new App();
    }
    return instance;
  }
  /**
  * Create the application instance
  */
  constructor() {
    const pkg = require(path.join(process.cwd(), 'package.json'));
    super(null, Object.assign(pkg, { name: 'app', dir: path.join(__dirname, '..') }));
    // app reference is used in parent class, so we need a value
    Utils.defineGetter(this, 'app', this);
    /**
    * Module for handling system configuration storage
    * @type {AbstractConfig}
    */
    this.config;
    /**
    * Module for translating strings
    * @type {AbstractLang}
    */
    this.lang;
    /**
    * Module for logging messages
    * @type {AbstractLogger}
    */
    this.logger;
    /**
    * Reference to the DependencyLoader instance
    * @type {DependencyLoader}
    */
    this.dependencyloader;

    this.initialiseDependencies();
  }
  initialiseDependencies() {
    this.dependencyloader = new DependencyLoader(this.pkg.dependencies, this);
    this.dependencyloader.initialise();

    const missingUtilities = ['config', 'lang', 'logger'].filter(m => !this.hasOwnProperty(m));
    if(missingUtilities.length) {
      this.log('error', `Missing the following utilities: ${missingUtilities.join(', ')}`);
      this.log('error', `Shutting down.`);
      process.exit(1);
    }
  }
  /**
  */
  getModules() {
    return this.dependencyloader.modules;
  }
  /**
  * Retrieves a loaded module by name (if module name begins with 'adapt-authoring', this can be omitted)
  * @param {String} moduleName
  * @return {Module} module instance
  * @example
  * App.instance.getModule('adapt-authoring-myModule');
  * // or
  * App.instance.getModule('myModule');
  */
  getModule(moduleName) {
    return this.dependencyloader.modules[moduleName] || this.dependencyloader.modules[`adapt-authoring-${moduleName}`];
  }
  /**
  * Starts the app
  */
  async start() {
    try {
      await this.dependencyloader.preloadModules();
      await this.dependencyloader.bootModules();
      this.log('info', `running application from ${process.cwd()}`);
    } catch(e) {
      this.log('error', `failed to start application: ${e}\n${e.stack}`);
    }
  }
}

module.exports = App;
