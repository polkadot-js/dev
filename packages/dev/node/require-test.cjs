// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// This allows for compatibility with Jest environments using
// describe, it, test ...
//
// NOTE: node -r only works with commonjs files, hence using it here

const { JSDOM } = require('jsdom');
const { strict } = require('node:assert');
const { describe, it, test } = require('node:test');

// just enough browser functionality for testing-library
const dom = new JSDOM();

globalThis.window = dom.window;

['document', 'navigator']
  .forEach((globalName) => {
    globalThis[globalName] = dom.window[globalName];
  });

// map describe/it/test behavior to node:test
Object
  .entries({ describe, it, test })
  .forEach(([globalName, fn]) => {
    const wrap = (name, ...args) => fn(name, ...args);
    const flag = (options) => (name, ...args) => fn(name, options, ...args);

    wrap.only = flag({ only: true });
    wrap.skip = flag({ skip: true });
    wrap.todo = flag({ todo: true });

    globalThis[globalName] = wrap;
  });

// a poor-man's version of expect (ease of migration)
globalThis.expect = (value) => ({
  not: {
    toBe: (other) => strict.notEqual(value, other),
    toBeDefined: () => strict.equal(value, undefined),
    toBeFalsy: () => strict.ok(value),
    toBeTruthy: () => strict.ok(!value),
    toEqual: (other) => strict.notDeepEqual(value, other),
    toThrow: (message) => strict.doesNotThrow(value, { message })
  },
  toBe: (other) => strict.equal(value, other),
  toBeDefined: () => strict.notEqual(value, undefined),
  toBeFalsy: () => strict.ok(!value),
  toBeTruthy: () => strict.ok(value),
  toEqual: (other) => strict.deepEqual(value, other),
  toThrow: (message) => strict.throws(value, { message })
});
