/// <reference types="greasemonkey" />

// XXX although this is packaged in standard bundle formats (e.g. CommonJS and
// ESM), the main/recommended format is an IIFE which declares GMCompat as a
// constant. this is required to work around engine bugs which cause window
// properties to leak across scripts on the same site. [1] [2]
//
// a constant declaration is local to each script on all engines.
//
// [1] https://github.com/violentmonkey/violentmonkey/issues/1102
// [2] https://github.com/greasemonkey/greasemonkey/issues/3093

let $unsafeWindow = unsafeWindow

const { assign, freeze } = Object
const { wrappedJSObject } = $unsafeWindow // Violentmonkey for Firefox
const { slice } = []

const GMCompat = {
    unsafeWindow: wrappedJSObject ?
        ($unsafeWindow = wrappedJSObject) :
        $unsafeWindow
}

const CLONE_INTO_OPTIONS = {
    cloneFunctions: true,
    target: $unsafeWindow,
    wrapReflectors: true,
}

const EXPORT_FUNCTION_OPTIONS = {
    target: $unsafeWindow,
}

/*
 * +cloneInto+ and +exportFunction+ are only needed by Violentmonkey for
 * Firefox and Greasemonkey 4, though Violentmonkey for Chrome also defines
 * them (as identity functions [1]), so it's safe to delegate to them in
 * that case as well
 *
 * [1] https://git.io/JJziH
 */

const __cloneInto = object => object

const __exportFunction = (fn, { defineAs, target = $unsafeWindow } = {}) => {
    return defineAs ? target[defineAs] = fn : fn
}

const _cloneInto = typeof cloneInto === 'function'
    ? cloneInto
    : __cloneInto

const _exportFunction = typeof exportFunction === 'function'
    ? exportFunction
    : __exportFunction

assign(GMCompat, {
    apply ($this, fn, _args) {
        // XXX Firefox doesn't seem to have implemented a cloner for the
        // `arguments` object, so we need to convert it into an array
        const args = slice.call(_args)
        return fn.apply($this, this.cloneInto(args))
    },

    call ($this, fn, ..._args) {
        const args = this.cloneInto(_args)
        return fn.call($this, ...args)
    },

    cloneInto (object, _options) {
        const options = _options
            ? assign({}, CLONE_INTO_OPTIONS, _options)
            : CLONE_INTO_OPTIONS

        // cloneInto ignores the extra `target` option
        return _cloneInto(object, options.target, options)
    },

    export (value, options) {
        return typeof value === 'function'
            ? this.exportFunction(value, options)
            : this.cloneInto(value, options)
    },

    exportFunction (fn, _options) {
        const options = _options
            ? assign({}, EXPORT_FUNCTION_OPTIONS, _options)
            : EXPORT_FUNCTION_OPTIONS

        // exportFunction ignores the extra `target` option
        return _exportFunction(fn, options.target, options)
    },

    unwrap (value) {
        return value ? (value.wrappedJSObject || value) : value
    },
})

export default freeze(GMCompat)
