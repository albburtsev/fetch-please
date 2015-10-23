import {assign, joinParams, toLowerKeys} from './helpers';

export const HTTP_METHOD_GET = 'GET';
export const HTTP_METHOD_PUT = 'PUT';
export const HTTP_METHOD_POST = 'POST';
export const HTTP_METHOD_DELETE = 'DELETE';

/**
 * @class
 * HTTP-transport based on XHR
 * @property {String} path Common path
 * @property {Number} timeout Timeout (in milliseconds)
 * @property {Object} headers Common headers
 * @property {Array} opened List of opened requests
 * @property {XMLHttpRequest} XMLHttpRequest XHR interface
 * @property {Boolean} cors ```true``` if supported Cross-Origin Resource Sharing
 *
 * @see https://xhr.spec.whatwg.org/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 * @see http://www.html5rocks.com/en/tutorials/cors/
 */
class Talaria {
    /**
     * @param {String} path Common path for all requests
     * @param {Object} [settings] Object with settings
     * @param {Number} [settings.timeout = 0]
     * @param {Object} [settings.XMLHttpRequest = global.XMLHttpRequest]
     * @param {Function} [settings.handleResponse] Callback for handling all responses
     * @param {Object|Function} [settings.headers = {}]
     */
    constructor(path = '', settings = {}) {
        this.path = path;
        this.opened = [];

        assign(this, {
            timeout: 0,
            headers: {},
            XMLHttpRequest: global.XMLHttpRequest
        }, settings);

        let {XMLHttpRequest} = this;
        if (XMLHttpRequest) {
            this.cors = 'withCredentials' in (new XMLHttpRequest());
        }
    }

    /**
     * Creates XHR instance and Promise instance
     * @param {String} method HTTP method
     * @param {String} url
     * @param {Object} data
     * @param {Object} settings
     * @return {Object}
     */
    request(method, url, data) {
        if (!this.XMLHttpRequest) {
            throw new Error('Constructor XMLHttpRequest not found');
        }

        if (!global.Promise) {
            throw new Error('Constructor Promise not found');
        }

        let _handle = this.handleResponse,
            request = new this.XMLHttpRequest(),
            promise = new Promise(function (resolve, reject) {
                request.addEventListener('load', function() {
                    let {status, responseText, responseHeaders} = this,
                        {error, errorText, payload} = _handle(status, responseText, responseHeaders);

                    if (error) {
                        reject(error, errorText);
                    } else {
                        resolve(payload);
                    }
                });
            });

        // Send request
        request.open(method, url);
        request.send(data);

        // Add request into list
        this.opened.push(request);

        return {request, promise};
    }

    /**
     * Aborts all opened requests
     */
    abort() {
        // @todo
    }

    /**
     * Sends GET request
     * @param {String} url
     * @param {Object} [params]
     * @param {Object} [settings]
     * @return {Promise}
     */
    get(url, params, settings) {
        let {promise} = this.getRequest(url, params, settings);
        return promise;
    }

    /**
     * Sends PUT request
     * @param {String} url
     * @param {Object} data
     * @param {Object} [settings]
     * @return {Promise}
     */
    put() {
        // @todo
    }

    /**
     * Sends POST request
     * @param {String} url
     * @param {Object} data
     * @param {Object} [settings]
     * @return {Promise}
     */
    post() {
        // @todo
    }

    /**
     * Sends DELETE request
     * @param {String} url
     * @param {Object} [settings]
     * @return {Promise}
     */
    delete() {
        // @todo
    }

    /**
     * Sends same GET request but returns object with instances of XHR and Promise
     * @param {String} url
     * @param {Object} [params]
     * @param {Object} [settings]
     * @return {Object}
     */
    getRequest(url, params = null, settings = null) {
        url = joinParams(url, params);
        return this.request(HTTP_METHOD_GET, url, null, settings);
    }

    /**
     * Sends same PUT request but returns object with instances of XHR and Promise
     * @param {String} url
     * @param {Object} data
     * @param {Object} [settings]
     * @return {Object}
     */
    putRequest() {
        // @todo
    }

    /**
     * Sends same POST request but returns object with instances of XHR and Promise
     * @param {String} url
     * @param {Object} data
     * @param {Object} [settings]
     * @return {Object}
     */
    postRequest() {
        // @todo
        // @todo: don't forget about FormData
    }

    /**
     * Sends same DELETE request but returns object with instances of XHR and Promise
     * @param {String} url
     * @param {Object} [settings]
     * @return {Object}
     */
    deleteRequest() {
        // @todo
    }

    /**
     * Handles response
     * @param {String} status
     * @param {String} text
     * @param {Object} headers
     * @return {Object}
     */
    handleResponse(status, text, headers = {}) {
        const MIN_SUCCESS_CODE = 200;
        const MAX_SUCCESS_CODE = 299;
        const CONTENT_TYPE_JSON_VALUE = 'application/json';

        // If status < 200 or status >= 200 then return error
        if (status < MIN_SUCCESS_CODE || status > MAX_SUCCESS_CODE) {
            return {
                error: true,
                errorText: 'HTTP error'
            };
        }

        // If header Content-Type has value "application/json" then parse text as JSON
        headers = toLowerKeys(headers);
        if (headers) {
            let contentType = headers['content-type'] || '';
            contentType = contentType.toLowerCase();

            if (contentType.indexOf(CONTENT_TYPE_JSON_VALUE) !== -1) {
                try {
                    let data = JSON.parse(text);
                    return {payload: data};
                } catch (e) {
                    // Error occured
                    return {
                        error: true,
                        errorText: 'JSON parse error'
                    };
                }
            }
        }

        // Just return given text
        return {payload: text};
    }
}

export default Talaria;
