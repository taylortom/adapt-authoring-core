/**
 * Parent class for authoring tool modules
 * @constructor
 */
class Module {
  /**
  * [optional] function to call any actions required to 'preload' the module
  * Called by moduleloader
  * @param app reference to the app instance
  * @return Promise
  */
  preload(app) {

  }
}

module.exports = Module;
