import {assign, joinParams, toLowerKeys} from './helpers';

export const HTTP_METHOD_GET = 'GET';
export const HTTP_METHOD_PUT = 'PUT';
export const HTTP_METHOD_POST = 'POST';
export const HTTP_METHOD_DELETE = 'DELETE';
export const ALLOWED_METHODS = [
    HTTP_METHOD_GET,
    HTTP_METHOD_PUT,
    HTTP_METHOD_POST,
    HTTP_METHOD_DELETE
];

export const ERROR_XHR_NOT_FOUND = 'Constructor XMLHttpRequest not found';
export const ERROR_PROMISE_NOT_FOUND = 'Constructor Promise not found';
export const ERROR_UNKNOWN_HTTP_METHOD = 'Unknown HTTP method';

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
            throw new Error(ERROR_XHR_NOT_FOUND);
        }

        if (!global.Promise) {
            throw new Error(ERROR_PROMISE_NOT_FOUND);
        }

        if (ALLOWED_METHODS.indexOf(method) === -1) {
            throw new Error(ERROR_UNKNOWN_HTTP_METHOD);
        }

        let _handle = this.handleResponse,
            request = new this.XMLHttpRequest(),
            promise = new Promise(function (resolve, reject) {
                request.addEventListener('load', function() {
                    let {error, payload} = _handle(this);

                    if (error) {
                        reject(new Error(this));
                    } else {
                        resolve(payload);
                    }
                });

                request.addEventListener('error', function() {
                    reject(new Error(this));
                });

                request.addEventListener('abort', function() {
                    reject(new Error(this));
                });

                request.addEventListener('timeout', function() {
                    reject(new Error(this));
                });
            });

        // Send request
        request.open(method, url);
        request.send(data);

        // Add request into list of opened requests
        this.add(request);

        // Handle removing request from list of opened requests
        promise.then(() => {
            this.close(request);
        }, () => {
            this.close(request);
        });

        return {request, promise};
    }

    /**
     * Aborts all opened requests
     */
    abort() {
        // @todo
    }

    /**
     * Adds request to list of opened requests
     * @param {XMLHttpRequest} request
     */
    add(request) {
        this.opened.push(request);
    }

    /**
     * Deletes request from list of opened requests
     * @param {XMLHttpRequest} request
     */
    close(request) {
        let idx = this.opened.indexOf(request);
        if (idx !== -1) {
            this.opened.splice(idx, 1);
        }
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
     * Handles XHR response
     * @param {XMLHttpRequest} xhr
     * @param {String} xhr.status
     * @param {String} xhr.responseText
     * @see https://xhr.spec.whatwg.org/#interface-xmlhttprequest
     * @return {Object}
     */
    handleResponse(xhr) {
        const MIN_SUCCESS_CODE = 200;
        const MAX_SUCCESS_CODE = 299;
        const CONTENT_TYPE_JSON_VALUE = 'application/json';

        let {status, responseText} = xhr;

        // If status < 200 or status >= 200 then return error
        if (status < MIN_SUCCESS_CODE || status > MAX_SUCCESS_CODE) {
            return {error: true};
        }

        // If header Content-Type has value "application/json" then parse text as JSON
        let contentType = xhr.getResponseHeader('Content-Type');
        if (contentType) {
            contentType = contentType.toLowerCase();

            if (contentType.indexOf(CONTENT_TYPE_JSON_VALUE) !== -1) {
                try {
                    let data = JSON.parse(responseText);
                    return {payload: data};
                } catch (e) {
                    return {error: true};
                }
            }
        }

        // Just return given text
        return {payload: responseText};
    }
}

export default Talaria;
