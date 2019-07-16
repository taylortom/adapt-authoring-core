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
        this.handleError(`${this.app.lang.t('app.error.nopackage')}, ${e}`);
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

  initialiseUtilities(utils) {
    utils.forEach(u => {
      if(!this.utilities[u]) {
        return this.handleError(`Missing ${u} utility`);
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
      return this.handleError(`missing dependency '${d}'`, 'warn');
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
      return this.handleError('expected class');
    }
    try {
      instance = new ModClass(this.app, pkg);
      if(!instance instanceof Module) {
        return this.handleError('expected a Module subclass');
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
  * Retrieves a loaded module by name (if module name begins with 'adapt-authoring', this can be omitted)
  * @param {String} moduleName
  * @return {Module} module instance
  * @example
  * App.instance.dependencyloader.getModule('adapt-authoring-myModule');
  * // or
  * App.instance.dependencyloader.getModule('myModule');
  */
  getModule(name) {
    return this.modules[name] || this.modules[`adapt-authoring-${name}`];
  }
  /**
  * @note we can't guarantee there's a Logger module at this point
  */
  handleError(e, type = 'error') {
    this.emit('error', e);
  }
}

module.exports = DependencyLoader;
