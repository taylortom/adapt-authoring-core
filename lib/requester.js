const axios = require('axios');
const Errors = require('./errors');
const Logger = require('adapt-authoring-logger');

/**
 * Convenience class for sending HTTP responses in a standard format
 */
class Requester {
  /**
   * Instanciates the Responder
   * @param {String} url URL to request
   */
  constructor(url) {
    if(url[0] === '/') {
      url = `http://localhost:5000/api${url}`;
    }
    this.url = url;
  }

  put(options = {}) {

  }

  get(options = {}) {
    return request('get', this.url, options);
  }

  update(options = {}) {

  }

  delete(options = {}) {

  }
}
/**
 * Send an HTTP request
 */
function request(method, url, options) {
  return axios[method](url, options);
}

module.exports = Requester;
