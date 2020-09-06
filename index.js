/*
 * compatibility shim for unsafeWindow needed by Violentmonkey for Firefox and
 * Greasemonkey 4: https://git.io/JUsbC
 */

const GMCompat = (function () {
    // minification helpers
    const { freeze, assign } = Object

    const $GMCompat = { unsafeWindow }

    /*
     * set up a cross-engine API to shield us from differences between engines
     * so we don't have to clutter the code with conditionals.
     *
     * XXX the functions are only needed by Violentmonkey for Firefox and
     * Greasemonkey 4, though Violentmonkey for Chrome also defines them (as
     * identity functions) for compatibility
     */
    if ((typeof cloneInto === 'function') && (typeof exportFunction === 'function')) {
        assign($GMCompat, { cloneInto, exportFunction })

        // Violentmonkey for Firefox
        const { wrappedJSObject } = unsafeWindow

        if (wrappedJSObject) {
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
