# gm-compat

<!-- toc -->

- [NAME](#name)
- [FEATURES](#features)
- [USAGE](#usage)
- [DESCRIPTION](#description)
  - [Why?](#why)
- [DEVELOPMENT](#development)
  - [NPM Scripts](#npm-scripts)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- tocstop -->

# NAME

gm-compat - portable modifications to page properties (`unsafeWindow`) for userscripts

# FEATURES

- Portable acces to:
  - `unsafeWindow`
  - `cloneInto`
  - `exportFunction`
- ~ 600 B minified
- CDN build ([jsDelivr](https://cdn.jsdelivr.net/gh/chocolateboy/gm-compat@0.1/index.min.js))

# USAGE

```javascript
// ==UserScript==
// @name          My Userscript
// @description   A userscript which hooks XMLHttpRequest#open
// @include       https://www.example.com/*
// @require       https://cdn.jsdelivr.net/gh/chocolateboy/gm-compat@0.0.1/index.min.js
// ==/UserScript==

function hookXHROpen (oldOpen) {
    return function open (...args) {
        oldOpen.apply(this, args) // there's no return value

        if (!matches(args)) {
            return
        }

        // register a new listener
        this.addEventListener('load', () => { ... })
    }
}

const xhrProto = GMCompat.unsafeWindow.XMLHttpRequest.prototype

xhrProto.open = GMCompat.exportFunction(
    hookXHROpen(xhrProto.open),
    Compat.unsafeWindow
)
```

# DESCRIPTION

This is a simple compatibility shim which provides uniform, cross-engine access
to the following properties:

- [`unsafeWindow`][unsafeWindow]
- [`cloneInto`][cloneInto]
- [`exportFunction`][exportFunction]

Modifications to a page's window (`unsafeWindow`) need to use the `cloneInto`
and `exportFunction` functions in Firefox userscript engines. However, these
functions are not available by default in Chrome. In addition, `unsafeWindow`
is not the actual `unsafeWindow` object in all engines.

Since the functions are needed on Firefox, the options for writing portable
scripts which modify page properties are either to implement
browser/engine-specific code in each script or to use a shim which exposes
a uniform API that works with all engines — which is what gm-compat provides.

When the functions are not needed (e.g. on most Chrome engines), they're
implemented as pass-through (identity) functions, so they work consistently in
all cases.

## Why?

Because writing cross-engine code which mutates page properties is fiddly and
non-obvious. This shim aims to abstract away the inconsistencies and
incompatibilities so that scripts don't need to reinvent it.

# DEVELOPMENT

<details>

## NPM Scripts

The following NPM scripts are available:

- build - generate the minified build of the library (index.min.js)
- doctoc - update the table-of-contents (TOC) in the README

</details>

# SEE ALSO

- [gm4-polyfill](https://github.com/greasemonkey/gm4-polyfill) - A polyfill for the GM4 API for GM3-compatible userscript engines

# VERSION

0.0.1

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2020 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[cloneInto]: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Language_Bindings/Components.utils.cloneInto
[exportFunction]: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Language_Bindings/Components.utils.exportFunction
[unsafeWindow]: https://sourceforge.net/p/greasemonkey/wiki/unsafeWindow/
