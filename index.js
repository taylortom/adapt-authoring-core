const App = require('./lib/app');
const DataStore = require('./lib/datastore');
const DataStoreQuery = require('./lib/datastorequery');
const Events = require('./lib/events');
const Hookable = require('./lib/loadable');
const Loadable = require('./lib/hookable');
const Module = require('./lib/module');
const Requester = require('./lib/requester');
const Responder = require('./lib/responder');
const Utils = require('./lib/utils');

module.exports = {
  App,
  DataStore,
  DataStoreQuery,
  Events,
  Hookable,
  Loadable,
  Module: Utils.compose(Module, Hookable, Loadable, Events),
  Requester,
  Responder,
  Utils
};
