const EventEmitter = require('events');

const emitter = new EventEmitter();

const Events = superclass => class extends superclass {
  constructor(...args) {
    super(...args);
    this.__emitter = new EventEmitter();
  }

  static emit(...args) {
    emitter.emit(...args);
  }
  static on(...args) {
    emitter.on(...args);
  }

  emit(...args) {
    this.__emitter.emit(...args);
  }
  on(...args) {
    this.__emitter.on(...args);
  }
};

module.exports = Events;
