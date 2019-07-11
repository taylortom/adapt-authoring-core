const Errors = require('../lang/en/errors.json');
const Events = require('./events');
const Module = require('./module');
const path = require('path');
/**
* Handles the loading of Adapt authoring tool module dependencies.
*/
class DependencyLoader extends Events {
  /**
  * @param {Object} dependencies The dependencies
  * @param {Object} app The main app instance
  */
  constructor(dependencies, app) {
    super();
    /**
    * Name of the class (onvenience function to stay consistent with other classes)
    * @type {String}
    */
    this.name = this.constructor.name;
    /**
    * Reference to the main app
    * @type {App}
    */
    this.app = app;
    /**
    * List of dependent modules in NPM package.json dependencies format
    * @type {Array<String>}
    */
    this.dependencies = Object.keys(dependencies);
    /**
    * List of module instances
    * @type {object}
    */
    this.modules = {};
    /**
    * List of utility instances
    * @type {object}
    */
    this.utilities = {};

  }
  /**
  * Initialises all defined dependent modules
  * @emits {initialised} Emits event on all modules initialised
  */
  initialise() {
    this.dependencies.forEach(d => {
      try {
        const dir = path.join(process.cwd(), 'node_modules', d);
        const c = require(path.join(dir, 'package.json'));

        if(!c.adapt_authoring) return;

        c.dir = dir;

        if(c.adapt_authoring.module) this.modules[d] = { pkg: c };
        if(c.adapt_authoring.utility) this.utilities[d] = { pkg: c };

      } catch(e) {
        this.logError(`${Errors.MissingPackageJson}, ${e}`);
      }
    });
  }
  /**
  * Initialises all defined dependent modules
  * @emits {initialised} Emits event on all modules initialised
  */
  initialise() {
    Object.entries(this.utilities).forEach(([name, data]) => this.initialiseUtility(name, data.pkg));
    Object.entries(this.modules).forEach(([name, data]) => this.initialiseModule(name, data.pkg));
    this.emit('initialised');
  }
  /**
  * Initialises a single module
  * @param {Object} name Name of the module to initialise
  * @param {Object} pkg Package.json data
  */
  initialiseModule(name, pkg) {
    const deps = pkg.adapt_authoring.moduleDependencies;
    // check any defined dependencies exist
    if(deps && Object.keys(deps).length && !deps.every(d => this.dependencies.includes(d))) {
      return this.logError(`missing dependency '${d}'`, 'warn');
    }
    // Try to import and instantiate the module
    let ModClass, instance;
    try {
      ModClass = require(name);
      if(typeof ModClass === 'object') {
        ModClass = ModClass.Module;
      }
    } catch(e) {
      return this.logError(`${e}\n\n${e.stack}`);
    }
    if(typeof ModClass !== 'function') {
      return this.logError('expected class');
    }
    try {
      instance = new ModClass(this.app, pkg);
      if(!instance instanceof Module) {
        return this.logError('expected a Module subclass');
      }
    } catch(e) {
      return this.logError(e);
    }
    return instance;
  }
  /**
  * Loads a single utility
  * @param {Object} name Name of the utility to initialise
  * @param {Object} pkg Package.json data
  */
  initialiseUtility(name, pkg) {
    try {
      if(!pkg.adapt_authoring || !pkg.adapt_authoring.utility) {
        return; // (probably) not an authoring utility
      }
      const UtilityClass = require(name);
      return new UtilityClass(this.app, pkg);

    } catch(e) {
      return this.logError(e);
    }
  }
  /**
  * Preloads all defined dependent modules
  * @emits {preloaded} Emitted on all modules preloaded
  * @return {Promise}
  */
  preloadModules() {
    return this.callFunctionOnModules('preloadDelegate')
      .then(() => this.emit('preloaded'));
  }
  /**
  * Boots all defined dependent modules
  * @emits {booted} Emitted on all modules booted
  * @return {Promise}
  */
  bootModules() {
    return this.callFunctionOnModules('bootDelegate')
      .then(() => this.emit('booted'));
  }
  /**
  * @ignore
  * Asynchronously calls a function on all this.modules
  */
  callFunctionOnModules(funcName) {
    return Promise.all(Object.values(this.modules).map(instance => {
      return new Promise((resolve, reject) => {
        if(!instance[funcName]) return resolve();
        instance[funcName](this.app).then(resolve).catch(reject);
      });
    }));
  }
  /**
  * Shorthand, includes generic prefix and module name
  * @note we can't guarantee there's a Logger module at this point
  */
  logError(e, type = 'error') {
    console.log(`${e.message}\n`);
    process.exit(1);
  }
}

module.exports = DependencyLoader;
