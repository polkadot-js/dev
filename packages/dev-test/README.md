# @polkadot/dev-test

This is a very basic Jest-compatible environment that could be used alongside tests. The need for this came from replacing Jest with `node --test` without rewriting all assertions.

It provides the following -

1. Browser `window`, `document`, `navigator` (see usage for browser-specific path)
2. `jest` functions, specifically `spyOn` (not comprehensive, some will error, some witll noop)
3. `expect` functions (not comprehensive, caters for specific polkadot-js usage)


## Usage

On thing to note is that `node:test` is still rapidly evolving - this includes the APIs and features. As such this requires at least Node 18.14, however 18.15+ is recommended.

The entry points are different based on the environment you would like to operate in. For a browser-like environment,

```
node --require @polkadot/dev-test/browser ...
```

or for a basic describe/expect/jest-only global environment

```
node --require @polkadot/dev-test/node ...
```

The `...` above indicates any additional Node options, for instance a full command could be -

```
node --require @polkadot/dev-test/node --test something.test.js
```
