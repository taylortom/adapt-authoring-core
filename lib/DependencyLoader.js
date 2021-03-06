/* eslint no-console: 0 */
const _ = require('lodash');
const Events = require('./Events');
const glob = require('glob');
const util = require('util');
const Utils = require('./Utils');
/** @ignore */ const globPromise = util.promisify(glob);
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
     * Key/value store of all the Adapt dependencies' configs. Note this includes dependencies which are not loaded as Adapt modules (i.e. `module: false`).
     * @type {Object}
     */
    this.configs = {};
    /**
     * List of dependency instances
     * @type {object}
     */
    this.instances = {};
    /**
     * Peer dependencies listed for each dependency
     * @type {object}
     */
    this.peerDependencies = {};
    /**
     * List of modules which have failed to load
     * @type {Array}
     */
    this.failedModules = [];
  }
  /**
   * Loads all Adapt module dependencies
   * @return {Promise}
   */
  async load() {
    await this.loadConfigs();

    const configValues = Object.values(this.configs);
    /*
     * Increase the Events max listener count to avoid getting a warning message
     * for all the 'moduleloaded' events we need to listen for
     * Allowing for 10 per module should be more than enough
     */
    this.setMaxListeners(configValues.length*10);
    // sort dependencies into priority
    const { essential, theRest } = configValues.reduce((m,c) => {
      c.isEssential ? m.essential.push(c.name) : m.theRest.push(c.name);
      return m;
    }, { essential: [], theRest: [] });
    // load each set of deps
    await this.loadModules(essential);

    if(this.failedModules.length) {
      throw new Error(`Failed to load modules ${this.failedModules.join(', ')}`);
    }
    try {
      await this.loadModules(theRest);
    } catch(e) {} // not a problem if non-essential module fails to load
  }
  /**
   * Loads configs for all dependencies
   * @return {Promise}
   */
  async loadConfigs() {
    /** @ignore */ this._configsLoaded = false;
    const files = await globPromise(`node_modules/**/${Utils.metadataFileName}`);
    const deps = files.map(d => d.replace(`/${Utils.metadataFileName}`, ''));
    await Promise.all(deps.map(async d => {
      try {
        const c = await Utils.loadModuleConfig(d);
        this.configs[c.name] = c;
        if(c.peerDependencies) {
          Object.keys(c.peerDependencies).forEach(p => {
            if(!this.peerDependencies[p]) this.peerDependencies[p] = [];
            this.peerDependencies[p].push(c.name);
          });
        }
      } catch(e) {
        this.logError(`Failed to load config for '${d}', module will not be loaded`);
        this.logError(e);
      }
    }));
    this._configsLoaded = true;
    this.emit('configsloaded');
  }
  /**
   * Loads a single Adapt module. Should not need to be called directly.
   * @param {String} modName Name of the module to load
   * @return {Promise} Resolves with module instance on module.onReady
   */
  async loadModule(modName) {
    if(this.instances[modName]) {
      throw new Error(`Module already exists`);
    }
    const config = this.configs[modName];

    if(config.module === false) {
      return;
    }
    let ModClass = require(modName);

    if(ModClass.Module) {
      ModClass = ModClass.Module;
    }
    if(!_.isFunction(ModClass)) {
      throw new Error(`Expected class to be exported`);
    }
    const instance = new ModClass(this.app, config);

    if(!_.isFunction(instance.onReady)) {
      throw new Error(`Module must define onReady function`);
    }
    try {
      await instance.onReady();
      this.instances[modName] = instance;
      this.emit('moduleloaded', modName, instance);
      return instance;
    } catch(e) {
      this.emit('modulefailed', modName);
      throw e;
    }
  }
  /**
   * Loads a list of Adapt modules. Should not need to be called directly.
   * @param {Array} modules Module names
   * @return {Promise} Resolves When all modules have loaded (or failed to load)
   */
  async loadModules(modules) {
    await Promise.allSettled(modules.map(async m => {
      try {
        await this.loadModule(m);
      } catch(e) {
        this.logError(`Failed to load '${m}',`, e);
        const deps = this.peerDependencies[m];
        if(deps && deps.length) {
          this.logError(`The following modules are peer dependencies, and may not work:`);
          deps.forEach(d => this.logError(`- ${d}`));
        }
        this.failedModules.push(m);
      }
    }));
  }
  /**
   * Waits for a single module to load
   * @param {String} modName Name of module to wait for
   * @return {Promise} Resolves with module instance on module.onReady
   */
  async waitForModule(modName) {
    if(!this._configsLoaded) {
      return new Promise((resolve, reject) => this.once('configsloaded', () => this.waitForModule(modName).then(resolve, reject)));
    }
    const longName = `adapt-authoring-${modName}`;
    const exists = this.configs[modName] || this.configs[longName];
    if(!exists) {
      throw new Error(`Missing required module '${modName}'`);
    }
    if(this.failedModules.includes(modName) || this.failedModules.includes(longName)) {
      throw new Error(`dependency '${modName}' failed to load`);
    }
    const instance = this.instances[modName] || this.instances[longName];
    if(instance) {
      return instance.onReady();
    }
    return new Promise((resolve, reject) => {
      const onLoad = (name, i) => {
        if(name === modName || name === longName) {
          this.off('moduleloaded', onLoad);
          i.onReady().then(resolve, reject);
        }
      };
      const onFail = name => {
        if(name === modName || name === longName) {
          this.off('modulefailed', onFail);
          reject(new Error(`dependency '${name}' failed to load`));
        }
      };
      this.on('moduleloaded', onLoad);
      this.on('modulefailed', onFail);
    });
  }
  /**
   * Logs an error message
   * @param {...*} args Arguments to be printed
   */
  logError(...args) {
    if(this.app.logger && this.app.logger._isReady) {
      this.app.logger.log('error', this.name, ...args);
    } else {
      console.log(...args);
    }
  }
}

module.exports = DependencyLoader;
