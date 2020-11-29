## 1.1.0 - 2020-11-29

- add `apply` and `call` helpers to safely call page functions
- release to NPM - this simplifies the URLs for [inclusion on GreasyFork](https://greasyfork.org/en/help/external-scripts)

## 1.0.0 - 2020-11-21

### Breaking Changes

- `cloneInto` and `exportFunction` now take an optional options object with a
  `target` field for the target (default: `unsafeWindow`) rather than separate
  target and options parameters
- `cloneInto` (and its `export` wrapper) defaults to `{ cloneFunctions: true, wrapReflectors: true }`

### Features

- add `unwrap` to access the wrapped object on Firefox

## 0.1.2 - 2020-09-20

- documentation tweaks

## 0.1.1 - 2020-09-06

- fix `export`'s `unsafeWindow` default

## 0.1.0 - 2020-09-06

- add an `export` shortcut which infers the right function and targets
  `unsafeWindow`

## 0.0.2 - 2020-09-06

- code cleanup

## 0.0.1 - 2020-09-06

- initial release
