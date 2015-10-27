import {assign, joinParams} from './helpers';

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

export const CONTENT_TYPE_JSON = 'application/json';
export const MIN_SUCCESSFUL_HTTP_CODE = 200;
export const MAX_SUCCESSFUL_HTTP_CODE = 299;

export const ERROR_XHR_NOT_FOUND = 'Constructor XMLHttpRequest not found';
export const ERROR_PROMISE_NOT_FOUND = 'Constructor Promise not found';
export const ERROR_UNKNOWN_HTTP_METHOD = 'Unknown HTTP method';
export const ERROR_UNACCEPTABLE_HTTP_CODE = 'Unacceptable HTTP code';
export const ERROR_JSON_PARSE = 'Invalid JSON';

export const ERROR_CONNECTION_TIMEOUT = 'Connection timeout';
export const ERROR_RESOURCE_ABORTED = 'Resource has been aborted';
export const ERROR_RESOURCE_FAILED = 'Resource failed to load';

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
 * @todo: methods post/postRequest
 * @todo: methods put/putRequest
 * @todo: methods delete/deleteRequest
 * @todo: cors
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
     * @param {String} path
     * @param {Object} data
     * @param {Object} settings
     * @return {Object}
     */
    request(method, path, data = null, settings = null) {
        if (!this.XMLHttpRequest) {
            throw new Error(ERROR_XHR_NOT_FOUND);
        }

        if (!global.Promise) {
            throw new Error(ERROR_PROMISE_NOT_FOUND);
        }

        if (ALLOWED_METHODS.indexOf(method) === -1) {
            throw new Error(ERROR_UNKNOWN_HTTP_METHOD);
        }

        let xhr = new this.XMLHttpRequest(),
            promise = new Promise(function (resolve, reject) {
                xhr.addEventListener('error', () => reject(ERROR_RESOURCE_FAILED));
                xhr.addEventListener('abort', () => reject(ERROR_RESOURCE_ABORTED));
                xhr.addEventListener('timeout', () => reject(ERROR_CONNECTION_TIMEOUT));
                xhr.addEventListener('load', () => {
                    if (xhr.status) {
                        resolve(xhr);
                    }
                });
            });

        settings = settings || {};
        promise = promise
            // Remove request from list of opened requests
            .then(() => this.close(xhr))
            .catch((error) => {
                this.close(xhr);
                throw new Error(error);
            })
            // Handle response
            .then(this.handleResponse)
            // Handle JSON in response
            .then(this.handleJson);

        // Form URL without normalizing and open request
        let url = this.path + path;
        xhr.open(method, url);

        // Set headers
        // Order of method's calls is important
        // You must call setRequestHeader() after open(), but before send()
        // @see: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#setRequestHeader()
        let headers = assign({}, this.headers, settings.headers);
        this.setHeaders(xhr, headers);

        // Set timeout (before send() too)
        // @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#Example_using_a_timeout
        let timeout = this.timeout || settings.timeout || 0;
        xhr.timeout = timeout;

        // Send request
        xhr.send(data);

        // Add request into list of opened requests
        this.add(xhr);

        return {xhr, promise};
    }

    /**
     * Iterates given headers and set them for XHR object
     * @param {XMLHttpRequest} xhr
     * @param {Object} headers
     * @return {XMLHttpRequest}
     */
    setHeaders(xhr, headers = {}) {
        return Object.keys(headers).reduce((xhr, header) => {
            xhr.setRequestHeader(header, headers[header]);
            return xhr;
        }, xhr);
    }

    /**
     * Aborts all opened requests
     */
    abort() {
        this.opened.forEach((xhr) => xhr.abort());
    }

    /**
     * Adds request to list of opened requests
     * @param {XMLHttpRequest} xhr
     */
    add(xhr) {
        this.opened.push(xhr);
    }

    /**
     * Deletes request from list of opened requests
     * @param {XMLHttpRequest} xhr
     * @return {XMLHtpRequest}
     */
    close(xhr) {
        let idx = this.opened.indexOf(xhr);
        if (idx !== -1) {
            this.opened.splice(idx, 1);
        }
        return xhr;
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
     * Handles JSON in response
     * @param {XMLHttpRequest} xhr
     * @param {String} xhr.responseText
     * @return {Object}
     */
    handleJson(xhr) {
        let {responseText} = xhr,
            contentType = xhr.getResponseHeader('Content-Type') || '';

        contentType = contentType.toLowerCase();

        // If header Content-Type has value "application/json" then parse text as JSON
        if (contentType.indexOf(CONTENT_TYPE_JSON) !== -1) {
            try {
                return JSON.parse(responseText);
            } catch (e) {
                throw new Error(ERROR_JSON_PARSE);
            }
        }
    }

    /**
     * Handles XHR response
     * @param {XMLHttpRequest} xhr
     * @param {Number} xhr.status
     * @see https://xhr.spec.whatwg.org/#interface-xmlhttprequest
     * @return {XMLHttpRequest}
     */
    handleResponse(xhr) {
        let {status} = xhr;

        // If status < 200 or status >= 200 then return error
        if (status < MIN_SUCCESSFUL_HTTP_CODE || status > MAX_SUCCESSFUL_HTTP_CODE) {
            throw new Error(ERROR_UNACCEPTABLE_HTTP_CODE);
        }

        // Just return given xhr
        return xhr;
    }
}

export default Talaria;
