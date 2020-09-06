const GMCompat = (function () {
    // minification helpers
    const { freeze, assign } = Object
    const $GMCompat = { unsafeWindow }

    /*
     * these functions are only needed by Violentmonkey for Firefox and
     * Greasemonkey 4, though Violentmonkey for Chrome also defines them (as
     * identity functions) for compatibility
     */
    if ((typeof cloneInto === 'function') && (typeof exportFunction === 'function')) {
        assign($GMCompat, { cloneInto, exportFunction })

        const { wrappedJSObject } = unsafeWindow

        if (wrappedJSObject) {
            // Violentmonkey for Firefox
            $GMCompat.unsafeWindow = wrappedJSObject
        }
    } else {
        assign($GMCompat, {
            cloneInto: (value => value),

            // this is the same implementation as Violentmonkey's compatibility
            // shim for Chrome: https://git.io/JJziH
            exportFunction (fn, target, { defineAs } = {}) {
                if (defineAs) {
                    target[defineAs] = fn
                }

                return fn
            }
        })
    }

    return freeze($GMCompat)
})();
