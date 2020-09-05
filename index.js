/*
 * compatibility shim for unsafeWindow needed by Violentmonkey for Firefox and
 * Greasemonkey 4: https://git.io/JUsbC
 */
(function () {
    const VERSION = 0.1
    const TYPE = Symbol.for('gm-compat')

    const type = typeof GMCompat

    if (
           (type === 'object')
        && GMCompat
        && (GMCompat.type === TYPE)
        && (typeof GMCompat.version === 'number')
    ) {
        if (GMCompat.version >= VERSION) {
            return
        }
    } else if (type !== 'undefined') {
        return
    }

    GMCompat = { unsafeWindow, type: TYPE, version: VERSION }

    /*
     * set up a cross-engine API to shield us from differences between engines
     * so we don't have to clutter the code with conditionals.
     *
     * XXX the functions are only needed by Violentmonkey for Firefox and
     * Greasemonkey 4, though Violentmonkey for Chrome also defines them (as
     * identity functions) for compatibility
     */
    if ((typeof cloneInto === 'function') && (typeof exportFunction === 'function')) {
        Object.assign(GMCompat, { cloneInto, exportFunction })

        // Violentmonkey for Firefox
        if (unsafeWindow.wrappedJSObject) {
            GMCompat.unsafeWindow = unsafeWindow.wrappedJSObject
        }
    } else {
        GMCompat.cloneInto = value => value

        // this is the same implementation as Violentmonkey's compatibility shim for
        // Chrome: https://git.io/JJziH
        GMCompat.exportFunction = (fn, target, { defineAs } = {}) => {
            if (defineAs) {
                target[defineAs] = fn
            }

            return fn
        }
    }

    Object.freeze(GMCompat)
})();
