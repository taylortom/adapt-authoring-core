const App = require('./app');
const axios = require('axios');
const { StatusCodes } = require('./responder');
/**
 * Convenience class for sending HTTP responses in a standard format
 */
class Requester {
  /**
   * Instanciates the Responder
   * @param {String} url URL for request
   */
  constructor(url) {
    /**
    * @type {String} url
    * @description The URL for the request
    */
    this.url = url;
  }
  /**
  * @param {Object} data Data to send with the request
  * @param {Object} options Options to pass to Axios
  * @see https://github.com/axios/axios#request-config
  * @return {Promise}
  */
  post(data, options = {}) {
    return request('post', this.url, data, options);
  }
  /**
  * @param {Object} options Options to pass to Axios
  * @see https://github.com/axios/axios#request-config
  * @return {Promise}
  */
  get(options = {}) {
    return request('get', this.url, options);
  }
}
/** @ignore */
function request(method, url, options) {
  return new Promise((resolve, reject) => {
    axios[method](url, options)
      .then(resolve)
      .catch(error => {
        let data;
        switch(error.code) {
          case 'ECONNREFUSED':
            data = {
              error: App.instance.lang.t('error.connectionrefused', { url }),
              statusCode: StatusCodes.Error.User
            };
            break;
          default:
            data = error.response && error.response.data || { error: App.instance.getConfig('error.unknownerror') };
        }
        const e = new Error(data.error);
        e.statusCode = data.statusCode;
        reject(e);
      });
  })
}

module.exports = Requester;
