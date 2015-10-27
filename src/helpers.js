export default {
    /**
     * Naive polyfill for Object.assign()
     * Why I did it? Because even modular lodash adds too much code in final build
     * @param {Object} target
     * @return {Object}
     */
    assign(target) {
        for (let i = 1; i < arguments.length; i++) {
            let obj = Object(arguments[i]),
                keys = Object.keys(obj);

            for (let j = 0; j < keys.length; j++) {
                let key = keys[j];

                if (!obj.hasOwnProperty(key)) {
                    continue;
                }

                target[key] = obj[key];
            }
        }

        return target;
    },

    /**
     * Returns URL with query string
     * @param {String} url
     * @param {Object} params
     * @return {String}
     */
    joinParams(url, params = null) {
        if (!params) {
            return url;
        }

        let queryString = Object.keys(params)
            .filter((key) => key && params[key])
            .map((key) => {
                let value = params[key].toString();

                key = encodeURIComponent(key);
                value = encodeURIComponent(value);

                return `${key}=${value}`;
            })
            .join('&');

        if (!queryString) {
            return url;
        }

        // Trim trailing "?"
        url = url.replace(/\?+$/, '');

        return url +
            (url.indexOf('?') === -1 ? '?' : '&') +
            queryString;
    }
};
