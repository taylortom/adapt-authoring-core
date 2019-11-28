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
    /**
    * Whether the loader failed during initialisation
    * @type {Boolean}
    */
    this.faileddOnInit = false;
  }
  configure() {
    Object.keys(this.dependencies).forEach(d => {
      let c, dir;
      try {
        dir = Utils.getModuleDir(d);
        c = require(path.join(dir, 'package.json'));
      } catch(e) {
        return this.handleInitError(`error.nopackage`, e);
      }
      if(!c.adapt_authoring) { // remove non-adapt deps
        delete this.dependencies[c.name];
        return;
      }
      this.dependencies[d] = Object.assign(c, { dir });

      if(c.adapt_authoring.module) {
        this.modules[d] = {};
      }
      if(c.adapt_authoring.utility && !this.utilities[c.adapt_authoring.utility]) {
        this.utilities[c.adapt_authoring.utility] = d;
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
    if(!this.faileddOnInit) this.emit('initialisedModules');
  }
  /**
  * Initialises the specified utilities (there must be a matching utility
  * registered to the app)
  * @param {Array} utils
  */
  initialiseUtilities(utils) {
    utils.forEach(u => {
      if(!this.utilities[u]) {
        return this.handleInitError('error.missingutil', { util: u });
      }
      const name = this.utilities[u];
      this.utilities[u] = this.createUtility(name, this.dependencies[name]);
    });
    if(!this.faileddOnInit) this.emit('initialisedUtilities');
  }
  /**
  * Initialises a single module
  * @param {Object} name Name of the module to initialise
  * @param {Object} pkg Package.json data
  */
  createModule(name, pkg) {
    const allDeps = Object.keys(this.dependencies);
    const deps = pkg.adapt_authoring.moduleDependencies;
    const missingDeps = deps && deps.filter(d => !allDeps.includes(d)) || [];
    // check any defined dependencies exist
    if(missingDeps.length) {
      missingDeps.forEach(d => this.handleInitError('error.missingdep', { module: name, dep: d }, 'warn'));
      return;
    }
    // Try to import and instantiate the module
    let ModClass, instance;
    try {
      ModClass = require(name);
    } catch(e) {
      return this.handleInitError('error.importmodule', { name: name, error: e, stack: e.stack });
    }
    if(ModClass.Module) {
      ModClass = ModClass.Module;
    }
    if(!Utils.isFunction(ModClass)) {
      return this.handleInitError('error.expectedclass', { name: ModClass.name, type: typeof ModClass });
    }
    try {
      instance = new ModClass(this.app, pkg);
    } catch(e) {
      return this.handleInitError('error.createmodule', { name: ModClass.name, error: e });
    }
    if(!(instance instanceof AbstractModule)) {
      return this.handleInitError('error.expectedmodule', { name: ModClass.name });
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
      return this.handleInitError('error.createutility', { name: name, error: e });
    }
    if(UtilityClass.Utility) {
      UtilityClass = UtilityClass.Utility;
    }
    if(!Utils.isFunction(UtilityClass)) {
      return this.handleInitError('error.expectedclass', { name: UtilityClass.name, type: typeof UtilityClass });
    }
    try {
      instance = new UtilityClass(this.app, pkg);
    } catch(e) {
      return this.handleInitError('error.createutility', { name: UtilityClass.name, error: e });
    }
    if(!(instance instanceof AbstractUtility)) {
      return this.handleInitError('error.expectedutility', { name: UtilityClass.name });
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
      .then(() => this.emit('preload')).catch(e => {
        throw new DependencyLoaderError('preloadmodule', { module: e.module, error: e }, 'error');
      });
  }
  /**
  * Boots all defined dependent modules
  * @emits {boot} Emitted on all modules booted
  * @return {Promise}
  */
  bootModules() {
    return this.callFunctionOnModules('bootDelegate')
      .then(() => this.emit('boot')).catch(e => {
        throw new DependencyLoaderError('bootmodule', { module: e.module, error: e }, 'error');
      });
  }
  /**
  * @ignore
  * Asynchronously calls a function on all this.modules
  */
  callFunctionOnModules(funcName) {
    return Promise.all(Object.values(this.modules).map(instance => {
      return new Promise((resolve, reject) => {
        if(!instance[funcName]) {
          return resolve();
        }
        instance[funcName](this.app).then(resolve).catch(e => {
          e.module = instance.name;
          reject(e);
        });
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
  * Deals with errors during initialisation (we can't guarantee there's a Logger module at this point, so just emit an event)
  * @param {String} key Lang key
  * @param {Object} data Data to be passed to the error class
  * @param {String} type Type of error
  * @emit {error}
  */
  handleInitError(key, data, type = 'error') {
    if(!this.faileddOnInit) {
      this.faileddOnInit = true;
    }
    this.emit('error', new DependencyLoaderError(key, data, type));
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
    /**
    * Language key to be used for main error message
    * @type {String}
    */
    this.key = key;
    /**
    * Data associated with the error
    * @type {Object}
    */
    this.data = data;
    /**
    * Type of error
    * @type {String}
    */
    this.type = type;
  }
}

module.exports = DependencyLoader;
