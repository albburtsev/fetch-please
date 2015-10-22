/**
 * @class
 * HTTP-transport based on XHR
 */
class Talaria {
    /**
     * @param {String} path Common path for all requests
     * @param {Object} [settings] Object with settings
     * @param {Number} [settings.timeout = 0]
     * @param {Object|Function} [settings.headers = {}]
     */
    constructor() {
        // @todo
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
    get() {
        // @todo
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
    getRequest() {
        // @todo
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
     * Handles JSON for all responses with content-type: application/json
     * @return {[type]} [description]
     */
    handleJson() {
        // @todo
    }
}

export default Talaria;
