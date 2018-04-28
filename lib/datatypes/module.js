/**
 * Parent class for authoring tool modules
 * @constructor
 */
class Module {
  get name() {
    return this.name;
  }

  get router() {
    return this.router;
  }
}

module.exports = Module;
