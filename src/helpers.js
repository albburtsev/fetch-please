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

        let queryString = Object.keys(params).reduce((query, key) => {
            let value = params[key];

            if (value) {
                value = value.toString();
                value = encodeURIComponent(value);
                key = encodeURIComponent(key);
                query.push(`${key}=${value}`);
            }

            return query;
        }, []).join('&');

        if (!queryString) {
            return url;
        }

        // Trim trailing "?"
        url = url.replace(/\?+$/, '');

        return url +
            (url.indexOf('?') === -1 ? '?' : '&') +
            queryString;
    },

    /**
     * Returns new object with keys in lower case ;)
     * @param {Object} obj
     * @return {Object}
     */
    toLowerKeys(obj) {
        return Object.keys(obj).reduce((lower, key) => {
            lower[key.toLowerCase()] = obj[key];
            return lower;
        }, {});
    }
};
