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
    }
};
