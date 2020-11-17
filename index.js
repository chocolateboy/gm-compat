const GMCompat = (function () {
    let $unsafeWindow = unsafeWindow

    // minification helpers
    const { assign, freeze } = Object
    const $function = 'function'

    const { wrappedJSObject } = $unsafeWindow // Violentmonkey for Firefox

    const GMCompat = {
        unsafeWindow: wrappedJSObject ?
            ($unsafeWindow = wrappedJSObject) :
            $unsafeWindow
    }

    const CLONE_INTO = {
        cloneFunctions: true,
        target: $unsafeWindow,
        wrapReflectors: true,
    }

    const EXPORT_FUNCTION = {
        target: $unsafeWindow,
    }

    /*
     * these functions are only needed by Violentmonkey for Firefox and
     * Greasemonkey 4, though Violentmonkey for Chrome also defines them (as
     * identity functions [1]), so it's safe to delegate to them in that case as
     * well
     *
     * [1] https://git.io/JJziH
     */
    if ((typeof cloneInto === $function) && (typeof exportFunction === $function)) { // Firefox or VM for Chrome
        assign(GMCompat, {
            cloneInto (object, _options) {
                const options = assign({}, CLONE_INTO, _options)
                // cloneInto ignores the extra `target` option
                return cloneInto(object, options.target, options)
            },

            exportFunction (fn, _options) {
                const options = assign({}, EXPORT_FUNCTION, _options)
                // exportFunction ignores the extra `target` option
                return exportFunction(fn, options.target, options)
            },
        })
    } else { // Chrome (excluding Violentmonkey for Chrome)
        assign(GMCompat, {
            cloneInto: (object => object),

            exportFunction (fn, { defineAs, target = $unsafeWindow } = {}) {
                if (defineAs) {
                    target[defineAs] = fn
                }

                return fn
            }
        })
    }

    assign(GMCompat, {
        export (value, options) {
            return (typeof value === $function)
                ? this.exportFunction(value, options)
                : this.cloneInto(value, options)
        },

        unwrap (value) {
            return value ? (value.wrappedJSObject || value) : value
        },
    })

    return freeze(GMCompat)
})();
