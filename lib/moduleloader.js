const Errors = require('./errors');
// TODO remove this dependency
const Logger = require('adapt-authoring-logger');
const Module = require('./module');
const path = require('path');
/**
* Handles the loading of Adapt authoring tool module dependencies.
*/
class ModuleLoader {
  /**
  * @param {Object} dependencies List of module dependencies (in package.json format)
  * @param {Object} app Used to store module references
  */
  constructor(dependencies, app) {
    /**
    * List of dependent modules in NPM package.json dependencies format
    * @type {object}
    */
    this.dependencies = Object.keys(dependencies);
    /**
    * Reference to the main app
    * @type {App}
    */
    this.app = app;
    /**
    * List of module instances
    * @type {object}
    */
    this.modules = {};
  }
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...Object} rest Arguments to log
  */
  log(level, ...rest) {
    Logger[level]('moduleloader', ...rest);
  }
  /**
  * Initialises all defined dependent modules
  */
  initialiseModules() {
    this.dependencies.forEach(d => this.initialiseModule(d));
  }
  /**
  * Initialises a single module
  * @param {Object} moduleName Name of the module to initialise
  */
  initialiseModule(moduleName) {
    // shorthand, includes generic prefix and module name
    const _log = (type, e) => this.log(type, `${Errors.Load} '${moduleName}', ${e}`);

    if(this.modules[moduleName]) {
      return; // already loaded
    }
    let moduleConfig, ModClass, instance;
    /*
    * Load and validate package.json config values
    */
    try {
      moduleConfig = require(path.join(process.cwd(), 'node_modules', moduleName, 'package.json'));
    } catch(e) {
      return _log('error', `${Errors.MissingPackageJson}, ${e}`);
    }
    if(!moduleConfig.adapt_authoring || !moduleConfig.adapt_authoring.module) {
      return; // (probably) not an authoring module
    }
    const deps = moduleConfig.adapt_authoring.moduleDependencies;
    // we have dependencies defined, check they all exist
    if(deps && Object.keys(deps).length && !deps.every(d => this.dependencies.includes(d))) {
      return _log('warn', `missing dependency '${d}'`);
    }
    /*
    * Try to import and instantiate the module
    */
    try {
      ModClass = require(moduleName);
    } catch(e) {
      return _log('error', `${e}\n\n${e.stack}`);
    }
    if(typeof ModClass === 'object' && ModClass.Module) {
      ModClass = ModClass.Module;
    }
    if(typeof ModClass !== 'function') {
      return _log('error', 'expected class');
    }
    try {
      instance = new ModClass(this.app, Object.assign({}, this.app.env, moduleConfig));
    } catch(e) {
      return _log('error', e);
    }
    if(!instance instanceof Module) {
      return _log('error', 'expected a Module subclass');
    }
    /*
    * Success! Module can be included in the preload/boot process so store it
    */
    this.modules[moduleName] = instance;
  }
  /**
  * Preloads all defined dependent modules
  * @return {Promise}
  */
  preloadModules() {
    return this.callFunctionOnModules('preloadDelegate');
  }
  /**
  * Boots all defined dependent modules
  * @return {Promise}
  */
  bootModules() {
    return this.callFunctionOnModules('bootDelegate');
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
}

module.exports = ModuleLoader;
