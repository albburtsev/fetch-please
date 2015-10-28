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
export const ERROR_INVALID_DATA = 'Invalid data for sending';
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
 * @todo: callback for headers in constructor
 * @todo: cors
 *
 * @see https://xhr.spec.whatwg.org/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 * @see http://www.html5rocks.com/en/tutorials/cors/
 */
class FetchPlease {
    /**
     * @param {String} path Common path for all requests
     * @param {Object} [settings] Object with settings
     * @param {Number} [settings.timeout = 0]
     * @param {Object} [settings.XMLHttpRequest = global.XMLHttpRequest]
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

        let handleJson = settings.handleJson || this.handleJson,
            handleError = settings.handleError || this.handleError,
            handleResponse = settings.handleResponse || this.handleResponse;

        promise = promise
            // Remove request from list of opened requests
            .then(
                () => this.close(xhr),
                (reason) => {
                    this.close(xhr);
                    throw new Error(reason);
                }
            )
            // Handle response
            .then(handleResponse)
            // Handle JSON in response
            .then(handleJson)
            // handle errors
            .catch(handleError);

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

        // Serialize data and send request
        data = this.serialize(data);
        xhr.send(data);

        // Add request into list of opened requests
        this.add(xhr);

        return {xhr, promise};
    }

    /**
     * Serializes data for request
     * @param {*} data
     * @return {String|FormData|Blob}
     */
    serialize(data) {
        // Do nothing with FormData instance
        if (global.FormData && data instanceof FormData) {
            return data;
        }

        // Do nothing with Blob instance
        if (global.Blob && data instanceof Blob) {
            return data;
        }

        // Do nothing with string or null
        if (data === null || typeof data === 'string') {
            return data;
        }

        try {
            // Serialize other data as JSON
            return JSON.stringify(data);
        } catch (e) {
            throw new Error(ERROR_INVALID_DATA);
        }
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
    put(url, data, settings) {
        let {promise} = this.putRequest(url, data, settings);
        return promise;
    }

    /**
     * Sends POST request
     * @param {String} url
     * @param {Object} data
     * @param {Object} [settings]
     * @return {Promise}
     */
    post(url, data, settings) {
        let {promise} = this.postRequest(url, data, settings);
        return promise;
    }

    /**
     * Sends DELETE request
     * @param {String} url
     * @param {Object} [params]
     * @param {Object} [settings]
     * @return {Promise}
     */
    delete(url, params, settings) {
        let {promise} = this.deleteRequest(url, params, settings);
        return promise;
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
    putRequest(url, data, settings = null) {
        return this.request(HTTP_METHOD_PUT, url, data, settings);
    }

    /**
     * Sends same POST request but returns object with instances of XHR and Promise
     * @param {String} url
     * @param {Object} data
     * @param {Object} [settings]
     * @return {Object}
     */
    postRequest(url, data, settings = null) {
        return this.request(HTTP_METHOD_POST, url, data, settings);
    }

    /**
     * Sends same DELETE request but returns object with instances of XHR and Promise
     * @param {String} url
     * @param {Object} [params]
     * @param {Object} [settings]
     * @return {Object}
     */
    deleteRequest(url, params = null, settings = null) {
        url = joinParams(url, params);
        return this.request(HTTP_METHOD_DELETE, url, null, settings);
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

    /**
     * Handles any occured errors
     * @param {Error} error
     * @return {Error}
     */
    handleError(error) {
        // Really do nothing
        throw new Error(error.message);
    }
}

export default FetchPlease;
