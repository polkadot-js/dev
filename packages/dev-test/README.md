# @polkadot/dev-test

This is a very basic Jest-compatible environment that could be used alongside tests. The need for this came from replacing Jest with `node --test` without rewriting all assertions.

It provides the following -

1. Browser `window`, `document`, `navigator` (see usage for browser-specific path)
2. `jest` functions, specifically `spyOn` (not comprehensive, some will error, some witll noop)
3. `expect` functions (not comprehensive, caters for specific polkadot-js usage)

Usage

```
node --require @polkadot/dev-test/browser
```

or

```
node --require @polkadot/dev-test/node
```
