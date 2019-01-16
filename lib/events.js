const EventEmitter = require('events');

const emitter = new EventEmitter();

const Events = superclass => class extends superclass {
  static emit(...args) {
    emitter.emit(...args);
  }

  static on(...args) {
    emitter.on(...args);
  }

  constructor(...args) {
    super(...args);

    const emitter = new EventEmitter();

    this.emit = emitter.emit;
    this.on = emitter.on;
  }
};

module.exports = Events;
