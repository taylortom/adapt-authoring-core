const EventEmitter = require('events');
/** @ignore */
const emitter = new EventEmitter();

/**
* Adds custom event handling to objects
*/
class Events {
  /**
   * Trigger a static event
   */
  static emit(...args) {
    emitter.emit(...args);
  }
  /**
   * Add an observer to a static event
   */
  static on(...args) {
    emitter.on(...args);
  }
  /**
   * Creates a new Event instance
   */
  constructor(...args) {
    const emitter = new EventEmitter();
    /**
    * Trigger an instance event
    * @see https://nodejs.org/api/events.html#events_emitter_emit_eventname_args
    */
    this.emit = emitter.emit;
    /**
    * Add an observer to an instance event
    * @see https://nodejs.org/api/events.html#events_emitter_on_eventname_listener
    */
    this.on = emitter.on;
  }
}

module.exports = Events;
