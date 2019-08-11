const AbstractModule = require('./abstractmodule');
const Events = require('./events');
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
    try {
      Object.keys(this.modules).forEach(m => this.modules[m] = this.createModule(m, this.dependencies[m]));
    } catch(e) {
      this.handleError(e);
    }
    this.emit('initialisedModules', this);
  }
  /**
  * Initialises the specified utilities (there must be a matching utility
  * registered to the app)
  * @param {Array} utils
  */
  initialiseUtilities(utils) {
    utils.forEach(u => {
      if(!this.utilities[u]) {
        return this.handleError(this.app.lang.t('error.missingutil', { util: u }));
      }
      const name = this.utilities[u];
      this.utilities[u] = this.createUtility(name, this.dependencies[name]);
    });
    this.emit('initialisedUtilities', this);
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
      return this.handleError(this.app.lang.t('error.missingdep', { dep: d }), 'warn');
    }
    // Try to import and instantiate the module
    let ModClass, instance;
    try {
      ModClass = require(name);
      if(typeof ModClass === 'object') {
        ModClass = ModClass.Module;
      }
    } catch(e) {
      return this.handleError(`${e}\n\n${e.stack}`);
    }
    if(typeof ModClass !== 'function') {
      return this.handleError(this.app.lang.t('error.expectedclass'));
    }
    try {
      instance = new ModClass(this.app, pkg);
      if(!instance instanceof AbstractModule) {
        return this.handleError(this.app.lang.t('error.expectedmodule'));
      }
    } catch(e) {
      return this.handleError(e);
    }
    return instance;
  }
  /**
  * Loads a single utility
  * @param {Object} name Name of the utility to initialise
  * @param {Object} pkg Package.json data
  */
  createUtility(name, pkg) {
    try {
      if(!pkg.adapt_authoring || !pkg.adapt_authoring.utility) {
        return; // (probably) not an authoring utility
      }
      let UtilityClass = require(name);
      if(UtilityClass.Utility) {
        UtilityClass = UtilityClass.Utility;
      }
      return new UtilityClass(this.app, pkg);

    } catch(e) {
      return this.handleError(e);
    }
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
  * @param {String} type Type of error
  * @emit {error}
  */
  handleError(e, type = 'error') {
    this.emit('error', e);
  }
}

module.exports = DependencyLoader;
