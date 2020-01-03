const Events = require('./events');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const util = require('util');
const Utils = require('./utils');

const globPromise = util.promisify(glob);
/**
* Handles the loading of Adapt authoring tool module dependencies.
*/
class DependencyLoader extends Events {
  /**
  * @param {Object} app The main app instance
  */
  constructor(app) {
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
    * Key/value store of dependent modules and their root path
    * @type {Object}
    */
    this.dependencies = {};
    /**
    * List of dependency instances
    * @type {object}
    */
    this.instances = {};
  }
  /**
  *
  */
  async getDependencies() {
    const globs = await globPromise('node_modules/*/adapt.json');
    return globs.map(d => d.match('node_modules/(.+)/adapt.json')[1]);
  }
  /**
  *
  */
  async load() {
    const coreApis = [], theRest = [];
    try {
      // preload all modules
      await Promise.all((await this.getDependencies()).map(async d => {
        const c = await this.loadModuleConfig(d);
        (c.coreApiName) ? coreApis.push(c) : theRest.push(c);
        this.dependencies[d] = c;
      }));
      // load any modules which define a 'coreApi'
      await this.loadModules(coreApis.map(m => m.name));
      // load all remaining modules
      await this.loadModules(theRest.map(m => m.name));
    } catch(e) {
      this.emit('loaderror', e);
    }
  }
  /**
  *
  */
  async loadModule(modName) {
    if(this.instances[modName]) {
      this.throwError('error.modulealreadyexists', { name: modName });
    }
    const config = this.dependencies[modName];

    if(config.module === false) {
      return;
    }
    let ModClass;
    let instance;
    let interval;
    try {
      ModClass = require(config.name);
    } catch(e) {
      this.throwError('error.importmodule', { name: modName, filepath: config.rootDir, error: e });
    }
    if(ModClass.Module) {
      ModClass = ModClass.Module;
    }
    if(!Utils.isFunction(ModClass)) {
      this.throwError('error.expectedclass', { name: modName });
    }
    try {
      instance = new ModClass(this.app, config);
    } catch(e) {
      this.throwError('error.createmodule', { name: modName, error: e });
    }
    if(!Utils.isFunction(instance.onReady)) {
      this.throwError('error.expectedonready', { name: modName });
    }
    instance.onReady().then(() => {
      this.instances[modName] = instance;
      if(config.coreApiName) this.app[config.coreApiName] = instance;
      this.emit('moduleloaded', modName, instance);
    });
    return instance.onReady();
  }
  /**
  *
  */
  async loadModuleConfig(modName) {
    const modPath = path.join(process.cwd(), 'node_modules', modName);
    try {
      return {
        ...(await fs.readJson(path.join(modPath, 'package.json'))),
        ...(await fs.readJson(path.join(modPath, 'adapt.json'))),
        rootDir: modPath
      };
    } catch(e) {
      this.throwError(`Failed to load module config for ${modPath}, ${e}`);
    }
  }
  /**
  *
  */
  async loadModules(modules) {
    const errors = [];
    await Promise.all(modules.map(async d => {
      try {
        await this.loadModule(d);
      } catch(e) {
        errors.push(e);
      }
    }));
    if(errors.length) {
      this.throwError('error.loadmodules', { errors });
    }
    return;
  }
  getModuleInstance(modName) {
    const logError = langKey => this.app.logger.log('error', this.name, this.app.lang.t(`error.${langKey}`, { name: modName }));
    const longName = `adapt-authoring-${modName}`;

    const config = this.dependencies[modName] || this.dependencies[longName];
    if(!config) return logError('getmodulenotinstalled');

    const instance = this.instances[modName] || this.instances[longName];
    if(!instance) return logError('getmodulenotloaded');

    return instance;
  }
  /**
  *
  */
  async waitFor(modName) {
    const longName = `adapt-authoring-${modName}`;
    const exists = this.dependencies[modName] || this.dependencies[longName];
    if(!exists) {
      this.throwError('error.missingmodule', { name: modName });
    }
    const instance = this.instances[modName] || this.instances[longName];
    if(instance) {
      return instance.onReady();
    }
    return await new Promise(resolve => {
      const l = async (name, instance) => {
        if(name !== modName && name !== longName) {
          return;
        }
        this.off('moduleloaded', l);
        const data = await instance.onReady();
        resolve(data);
      };
      this.on('moduleloaded', l);
    });
  }
  /**
  * Deals with errors during initialisation (we can't guarantee there's a Logger module at this point, so just emit an event)
  * @param {String} key Lang key
  * @param {Object} data Data to be passed to the error class
  * @param {String} type Type of error
  * @throws {DependencyLoaderError}
  */
  throwError(key, data, type = 'error') {
    throw new DependencyLoaderError(key, data, type);
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
