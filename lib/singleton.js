const logger = require('adapt-authoring-logger');

let instance;
/**
 */
const Singleton = superclass => class extends superclass {
  constructor(...args) {
    super(...args);
  }
  /**
  * Ensures only a single instance exists
  */
  static getInstance() {
    if(!instance) {
      instance = new this();
    }
    return instance;
  }
};

module.exports = Singleton;
