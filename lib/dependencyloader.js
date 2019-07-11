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
  get instances() {
    return [...Object.values(this.utilities), ...Object.values(this.modules)];
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

        if(c.adapt_authoring.module) {
          this.modules[d] = this.dependencies[d] = this.createModule(d,c);
          return;
        }
        if(c.adapt_authoring.utility) {
          this.utilities[d] = this.dependencies[d] = this.createUtility(d,c);
          return;
        }
        delete this.dependencies[d]; // not any use to us
      } catch(e) {
        this.handleError(`${Errors.MissingPackageJson}, ${e}`);
      }
    });
    try {
      this.instances.forEach(d => typeof d.initialise === 'function' && d.initialise());
    } catch(e) {
      this.handleError(e);
    }
    this.emit('initialised');
  }
  /**
  * Initialises a single module
  * @param {Object} name Name of the module to initialise
  * @param {Object} pkg Package.json data
  */
  createModule(name, pkg) {
    const deps = pkg.adapt_authoring.moduleDependencies;
    // check any defined dependencies exist
    if(deps && Object.keys(deps).length && !deps.every(d => this.dependencies.includes(d))) {
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
      const UtilityClass = require(name);
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
