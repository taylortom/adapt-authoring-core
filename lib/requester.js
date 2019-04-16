const axios = require('axios');
/**
 * Convenience class for sending HTTP responses in a standard format
 */
class Requester {
  /**
   * Instanciates the Responder
   * @param {String} url URL for request
   */
  constructor(url) {
    if(url[0] === '/') {
      url = `http://localhost:5000/api${url}`;
    }
    this.url = url;
  }
  /**
  *
  put(options = {}) {

  }
  */
  /**
  * @param {Object} options Options to pass to Axios
  * @see https://github.com/axios/axios#request-config
  * @return {Promise}
  */
  get(options = {}) {
    return request('get', this.url, options);
  }
  /**
  *
  update(options = {}) {

  }
  */
  /**
  *
  delete(options = {}) {

  }
  */
}
/**
 * Send an HTTP request
 */
function request(method, url, options) {
  return new Promise((resolve, reject) => {
    axios[method](url, options)
      .then(resolve)
      .catch(error => {
        const data = error.response.data;
        const e = new Error(data.error);
        e.statusCode = data.statusCode;
        reject(e);
      });
  })
}

module.exports = Requester;
