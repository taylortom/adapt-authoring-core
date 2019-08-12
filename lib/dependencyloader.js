const AbstractModule = require('./abstractmodule');
const AbstractUtility = require('./abstractutility');
const Events = require('./events');
const path = require('path');
const Utils = require('./utils');
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
    this.dependencies = dependencies;
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

    this.errors = [];

    Object.keys(this.dependencies).forEach(d => {
      try {
        const dir = path.join(process.cwd(), 'node_modules', d);
        const c = require(path.join(dir, 'package.json'));

        if(c.adapt_authoring) this.dependencies[d] = Object.assign(c, { dir });

        if(c.adapt_authoring.module) {
          this.modules[d] = {};
        }
        if(c.adapt_authoring.utility && !this.utilities.hasOwnProperty(c.adapt_authoring.utility)) {
          this.utilities[c.adapt_authoring.utility] = d;
        }
      } catch(e) {
        this.handleError(`error.nopackage`, e);
      }
    });
  }
  /**
  * Initialises all defined dependent modules
  * @emits {initialised} Emits event on all modules initialised
  */
  initialiseModules() {
    Object.keys(this.modules).forEach(m => {
      this.modules[m] = this.createModule(m, this.dependencies[m]);
    });
    this.emit('initialisedModules');
  }
  /**
  * Initialises the specified utilities (there must be a matching utility
  * registered to the app)
  * @param {Array} utils
  */
  initialiseUtilities(utils) {
    utils.forEach(u => {
      if(!this.utilities[u]) {
        return this.handleError('error.missingutil', { util: u });
      }
      const name = this.utilities[u];
      this.utilities[u] = this.createUtility(name, this.dependencies[name]);
    });
    this.emit('initialisedUtilities');
  }
  /**
  * Initialises a single module
  * @param {Object} name Name of the module to initialise
  * @param {Object} pkg Package.json data
  */
  createModule(name, pkg) {
    const allDeps = Object.keys(this.dependencies);
    const deps = pkg.adapt_authoring.moduleDependencies;
    // check any defined dependencies exist
    if(deps && Object.keys(deps).length && !deps.every(d => allDeps.includes(d))) {
      return this.handleError('error.missingdep', { dep: d }, 'warn');
    }
    // Try to import and instantiate the module
    let ModClass, instance;
    try {
      ModClass = require(name);
    } catch(e) {
      return this.handleError('error.loadmodule', `${e}\n\n${e.stack}`);
    }
    if(ModClass.Module) {
      ModClass = ModClass.Module;
    }
    if(typeof ModClass !== 'function') {
      return this.handleError('error.expectedclass');
    }
    try {
      instance = new ModClass(this.app, pkg);
    } catch(e) {
      return this.handleError('error.createmodule', e);
    }
    if(!(instance instanceof AbstractModule)) {
      return this.handleError('error.expectedmodule');
    }
    return instance;
  }
  /**
  * Loads a single utility
  * @param {Object} name Name of the utility to initialise
  * @param {Object} pkg Package.json data
  */
  createUtility(name, pkg) {
    let UtilityClass, instance;
      if(!pkg.adapt_authoring || !pkg.adapt_authoring.utility) {
        return; // (probably) not an authoring utility
      }
    try {
      UtilityClass = require(name);
    } catch(e) {
      console.log(e);
      return this.handleError('error.createutility', e);
    }
    if(UtilityClass.Utility) {
      UtilityClass = UtilityClass.Utility;
    }
    if(typeof UtilityClass !== 'function') {
      return this.handleError('error.expectedclass');
    }
    try {
      instance = new UtilityClass(this.app, pkg);
    } catch(e) {
      return this.handleError('error.createutility', e);
    }
    if(!(instance instanceof AbstractUtility)) {
      return this.handleError('error.expectedutility');
    }
    if(instance.errors.length) {
      return instance.errors.forEach(e => this.emit('error', e));
    }
    return instance;
  }
  /**
  * Preloads all defined dependent modules
  * @emits {preload} Emitted on all modules preloaded
  * @return {Promise}
  */
  preloadModules() {
    return this.callFunctionOnModules('preloadDelegate')
      .then(() => this.emit('preload'));
  }
  /**
  * Boots all defined dependent modules
  * @emits {boot} Emitted on all modules booted
  * @return {Promise}
  */
  bootModules() {
    return this.callFunctionOnModules('bootDelegate')
      .then(() => this.emit('boot'));
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
  * Retrieves a loaded module by name (if module name begins with 'adapt-authoring', this can be omitted)
  * @param {String} name Name of the Module
  * @return {AbstractModule} module instance
  * @example
  * App.instance.dependencyloader.getModule('adapt-authoring-myModule');
  * // or
  * App.instance.dependencyloader.getModule('myModule');
  */
  getModule(name) {
    return this.modules[name] || this.modules[`adapt-authoring-${name}`];
  }
  /**
  * Deals with errors (we can't guarantee there's a Logger module at this point,
  * so just emit an event)
  * @param {String} key Lang key
  * @param {Object} data Data to be passed to the error class
  * @param {String} type Type of error
  * @emit {error}
  */
  handleError(key, data, type = 'error') {
    const e = new DependencyLoaderError(key, data, type);
    this.emit('error', e);
  }
}
/**
* DependencyLoader Error
*/
class DependencyLoaderError extends Error {
  /**
  * @constructor
  * @param {String} key Language key to be used for main error message
  * @param {Object} data Data to be stored alongside error
  * @param {String} type Type of error (error, warn)
  */
  constructor(key, data, type) {
    super();
    this.key = key;
    this.data = data;
    this.type = type;
  }
}

module.exports = DependencyLoader;
