# gm-compat

<!-- TOC -->

- [NAME](#name)
- [FEATURES](#features)
- [USAGE](#usage)
- [DESCRIPTION](#description)
  - [Why?](#why)
  - [Why not?](#why-not)
- [TYPES](#types)
- [API](#api)
  - [cloneInto](#cloneinto)
  - [export](#export)
  - [exportFunction](#exportfunction)
  - [unsafeWindow](#unsafewindow)
  - [unwrap](#unwrap)
- [COMPATIBILITY](#compatibility)
- [DEVELOPMENT](#development)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- TOC END -->

# NAME

gm-compat - portable monkey-patching for userscripts

# FEATURES

- Portable access to:
  - [`unsafeWindow`][unsafeWindow]
  - [`cloneInto`][cloneInto]
  - [`exportFunction`][exportFunction]
- ~ 600 B minified
- CDN build ([jsDelivr][])

# USAGE

```javascript
// ==UserScript==
// @name          My Userscript
// @description   A userscript which hooks XMLHttpRequest#open
// @include       https://www.example.com/*
// @require       https://cdn.jsdelivr.net/gh/chocolateboy/gm-compat@1.0.0/index.min.js
// ==/UserScript==

const xhrProto = GMCompat.unsafeWindow.XMLHttpRequest.prototype
const oldOpen = xhrProto.open

function open (method, url, ...rest) {
    this.addEventListener('load', () => {
        process(this.responseText)
    })

    return oldOpen.call(this, method, url, ...rest)
}

xhrProto.open = GMCompat.export(open)
```

# DESCRIPTION

gm-compat is a tiny compatibility shim for userscripts which provides uniform,
cross-engine access to [`unsafeWindow`][unsafeWindow], [`cloneInto`][cloneInto]
and [`exportFunction`][exportFunction]. These can be used to portably modify
page properties, e.g. to hook [`XMLHttpRequest#open`][xhr#open] to intercept
HTTP requests.

Modifications to a page's window (`unsafeWindow`) need to use the `cloneInto`
and `exportFunction` functions on Firefox. However, these functions are not
available by default in Chrome. In addition, `unsafeWindow` is not the actual
`unsafeWindow` object in all engines.

Since the functions are needed on Firefox, the options for writing portable
scripts which modify page properties are either to implement
browser/engine-specific code in each script or to use a shim which exposes an
API that works with all engines. gm-compat provides an implementation of the
latter.

When the functions are not needed (i.e. in Chrome), they're implemented as
pass-through (identity) functions, so they work consistently in all cases.

Note that `GMCompat` is a local variable (declared with `const`), not a
property of the window object. This ensures that each script running on a page
can have its own isolated version of gm-compat without conflicts.

## Why?

Because writing portable code which modifies page properties is error-prone and
long-winded. This shim aims to abstract away the inconsistencies and
incompatibilities so that scripts don't need to reinvent it.

## Why not?

There may be no need to use this if scripts don't require Greasemonkey APIs and
are able to operate directly in the page context (i.e. `@grant none`), although
note that `@grant none` is [not supported][grant-none] by all engines, and
`@grant none` (and `unsafeWindow`) doesn't portably work on [all sites][csp].

# TYPES

The following types are referenced in the descriptions below.

```typescript
type CloneIntoOptions = {
    cloneFunctions?: boolean;
    target?: object;
    wrapReflectors?: boolean;
};

type ExportOptions = {
    target?: object;
};

type ExportFunctionOptions = {
    allowCrossOriginArguments?: boolean;
    defineAs?: string;
    target?: object;
};
```

# API

## cloneInto

**Type**: `<T extends object>(object: T, options?: CloneIntoOptions) ⇒ T`

Portable access to Firefox's [`cloneInto`][cloneInto] function, which returns a
version of the supplied object that can be accessed in the provided context.

```javascript
const dummyPerformance = {
    now () { ... }
}

GMCompat.unsafeWindow.performance = GMCompat.cloneInto(dummyPerformance)
```

If no options are supplied, the default values are:

```javascript
{ cloneFunctions: true, target: GMCompat.unsafeWindow, wrapReflectors: true }
```

If supplied, they are merged into/override the defaults.

## export

**Type**:
- `<T extends Function>(value: T, options?: ExportOptions) ⇒ T`
- `<T extends object>(value: T, options?: ExportOptions) ⇒ T`

A wrapper function which delegates to [`cloneInto`](#cloneinto) or
[`exportFunction`](#exportFunction), depending on the type of its argument,
i.e.:

```javascript
const fn = () => { ... }
GMCompat.export(fn)
```

is equivalent to:

```javascript
GMCompat.exportFunction(fn)
```

and:

```javascript
const obj = { ... }
GMCompat.export(obj)
```

is equivalent to:

```javascript
GMCompat.cloneInto(obj)
```

An optional options object can be supplied to override the default target
([`unsafeWindow`](#unsafeWindow)). This is passed as the options parameter to
[`cloneInto`](#cloneInto) or [`exportFunction`](#exportFunction) and merged
into their default options.

```javascript
GMCompat.export(obj, { target: iframe })
```

## exportFunction

**Type**: `<T extends Function>(value: T, options?: ExportFunctionOptions) ⇒ T`

Portable access to Firefox's [`exportFunction`][exportFunction] function, which
returns a version of the supplied function that can be executed in the provided
context.

```javascript
function log () { }

GMCompat.unsafeWindow.log = GMCompat.exportFunction(log)
```

If no options are supplied, the default values are:

```javascript
{ allowCrossOriginArguments: false, target: GMCompat.unsafeWindow }
```

If supplied, they are merged into/override the defaults.

## unsafeWindow

Portable access to the page's window. This is distinct from the `window` object
in userscripts, which is an isolated wrapper of the original window (i.e. the
page's `window` can't see properties of the userscript's `window`).

```javascript
GMCompat.unsafeWindow.log = GMCompat.unsafeWindow.noop
```

Note that accessing `unsafeWindow` directly, AKA `window.unsafeWindow`, does
*not* work in all engines, so this should be used instead if scripts are to be
run portably.

## unwrap

**Type**: `<T extends object>(object: T) ⇒ T`

Takes a wrapped object and returns its wrapped value. This is sometimes needed
when working with values transferred from the page to the userscript.

```javascript
let result

function callback (value) {
    result = value // may be wrapped (page -> userscript)
}

const $callback = GMCompat.export(callback)

GMCompat.unsafeWindow.onResult($callback)
result = GMCompat.unwrap(result)
```

# COMPATIBILITY

gm-compat has been tested on the following engines:

- Greasemonkey (v4.9)
- Tampermonkey for Firefox (v4.11.6117)
- Violentmonkey for Firefox (v2.12.7)
- Violentmonkey for Chrome (v2.12.7)

# DEVELOPMENT

<details>

<!-- TOC:ignore -->
## NPM Scripts

The following NPM scripts are available:

- build - generate the minified build of the library (index.min.js)
- build:doc - generate the README's TOC (table of contents)

</details>

# SEE ALSO

- [gm4-polyfill][] - A polyfill for the GM4 API for GM3-compatible userscript engines

# VERSION

1.0.0

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
[jsDelivr]: https://cdn.jsdelivr.net/gh/chocolateboy/gm-compat@1.0.0/index.min.js
[unsafeWindow]: https://sourceforge.net/p/greasemonkey/wiki/unsafeWindow/
[xhr#open]: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
