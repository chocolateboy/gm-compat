# gm-compat

<!-- toc -->

- [NAME](#name)
- [FEATURES](#features)
- [USAGE](#usage)
- [DESCRIPTION](#description)
  - [Why?](#why)
  - [Why not?](#why-not)
- [API](#api)
  - [cloneInto](#cloneinto)
  - [exportFunction](#exportfunction)
  - [unsafeWindow](#unsafewindow)
- [COMPATIBILITY](#compatibility)
- [DEVELOPMENT](#development)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- tocstop -->

# NAME

gm-compat - portable monkey-patching for userscripts

# FEATURES

- Portable access to:
  - [`unsafeWindow`][unsafeWindow]
  - [`cloneInto`][cloneInto]
  - [`exportFunction`][exportFunction]
- &lt; 350 B minified
- CDN build ([jsDelivr][])

# USAGE

```javascript
// ==UserScript==
// @name          My Userscript
// @description   A userscript which hooks XMLHttpRequest#open
// @include       https://www.example.com/*
// @require       https://cdn.jsdelivr.net/gh/chocolateboy/gm-compat@0.0.1/index.min.js
// ==/UserScript==

function hookXHROpen (oldOpen) {
    return function open (method, url) {
        if (match(url)) {
            // register a new listener
            this.addEventListener('load', () => {
                process(this.responseText)
            })
        }

        return oldOpen.apply(this, arguments)
    }
}

const xhrProto = GMCompat.unsafeWindow.XMLHttpRequest.prototype
const oldOpen = XMLHttpRequest.prototype.open // XXX must be the wrapped version

xhrProto.open = GMCompat.exportFunction(
    hookXHROpen(oldOpen),
    GMCompat.unsafeWindow
)
```

# DESCRIPTION

gm-compat is a tiny compatibility shim which provides uniform, cross-engine
access to [`unsafeWindow`][unsafeWindow], [`cloneInto`][cloneInto] and
[`exportFunction`][exportFunction] for userscripts. These can be used to
portably modify window properties, e.g. to hook
[`XMLHttpRequest#open`][xhr#open] to intercept HTTP requests.

Modifications to a page's window (`unsafeWindow`) need to use the `cloneInto`
and `exportFunction` functions in userscript engines on Firefox. However, these
functions are not available by default in Chrome. In addition, `unsafeWindow`
is not the actual `unsafeWindow` object in all engines.

Since the functions are needed on Firefox, the options for writing portable
scripts which modify page properties are either to implement
browser/engine-specific code in each script or to use a shim which exposes a
uniform API that works with all engines. gm-compat provides an implementation
of the latter.

When the functions are not needed (e.g. on most Chrome engines), they're
implemented as pass-through (identity) functions, so they work consistently in
all cases.

Note that `GMCompat` is a local variable (declared with `const`), not a
property of the window object. This ensures that each script running on a page
can have its own isolated version of gm-compat without conflicts.

## Why?

Because writing cross-engine code which mutates page properties is fiddly and
non-obvious. This shim aims to abstract away the inconsistencies and
incompatibilities so that scripts don't need to reinvent it.

## Why not?

There may be no need to use this if scripts don't require Greasemonkey APIs and
are able to operate directly in the page context (i.e. `@grant none`), although
note that `@grant none` is [not supported][grant-none] by all engines, and
`@grant none` (and `unsafeWindow`) doesn't portably work on [all sites][csp].

# API

## cloneInto

Portable access to Firefox's [`cloneInto`][cloneInto] function, which returns a
version of the supplied object that can be accessed in the provided context.

```javascript
const dummyPerformance = {
    now () { ... }
}

GMCompat.unsafeWindow.performance = GMCompat.cloneInto(
    dummyPerformance,
    GMCompat.unsafeWindow
)
```

## exportFunction

Portable access to Firefox's [`exportFunction`][exportFunction] function, which
returns a version of the supplied function that can be executed in the provided
context.

```javascript
function log () { }

GMCompat.unsafeWindow.log = GMCompat.exportFunction(
    log,
    GMCompat.unsafeWindow
)
```

## unsafeWindow

Portable access to the page's window. This is distinct from the `window` object
in userscripts, which is an isolated wrapper of the original window (i.e. the
page's `window` can't see properties of the userscript's `window`).

```javascript
GMCompat.unsafeWindow.maybeLog = GMCompat.unsafeWindow.noLog
```

Note that accessing `unsafeWindow` directly, AKA `window.unsafeWindow`, does
*not* work in all engines, so this should be used instead if scripts are to be
run portably.

# COMPATIBILITY

gm-compat has been tested on the following engines:

- Greasemonkey (v4.9)
- Tampermonkey for Firefox (v4.11.6117)
- Violentmonkey for Firefox (v2.12.7)
- Violentmonkey for Chrome (v2.12.7)

# DEVELOPMENT

<details>

## NPM Scripts

The following NPM scripts are available:

- build - generate the minified build of the library (index.min.js)
- doctoc - update the table-of-contents (TOC) in the README

</details>

# SEE ALSO

- [gm4-polyfill][] - A polyfill for the GM4 API for GM3-compatible userscript engines

# VERSION

0.0.1

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2020 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[cloneInto]: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Language_Bindings/Components.utils.cloneInto
[csp]: https://github.com/violentmonkey/violentmonkey/issues/1001
[exportFunction]: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Language_Bindings/Components.utils.exportFunction
[gm4-polyfill]: https://github.com/greasemonkey/gm4-polyfill
[grant-none]: https://github.com/greasemonkey/greasemonkey/issues/3015#issuecomment-436645719
[jsDelivr]: https://cdn.jsdelivr.net/gh/chocolateboy/gm-compat@0.0.1/index.min.js
[unsafeWindow]: https://sourceforge.net/p/greasemonkey/wiki/unsafeWindow/
[xhr#open]: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
