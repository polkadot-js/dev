// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// This allows for compatibility with Jest environments using
// describe, it, test ...
//
// NOTE: node --require only works with commonjs files, hence using it here
// NOTE: --import was added in Node 19 that would simplify, but too early

const { JSDOM } = require('jsdom');
const assert = require('node:assert/strict');
const { after, afterEach, before, beforeEach, describe, it } = require('node:test');

// just enough browser functionality for testing-library
const dom = new JSDOM();

// pin-point globals, i.e. available functions
Object
  .entries(({
    // browser environment via JSDOM
    ...{ document: dom.window.document, navigator: dom.window.navigator, window: dom.window },
    // testing environment via node:test
    ...{ afterAll: after, afterEach, beforeAll: before, beforeEach }
  }))
  .forEach(([globalName, fn]) => {
    globalThis[globalName] = fn;
  });

// map describe/it behavior to node:test
Object
  .entries({ describe, it })
  .forEach(([globalName, fn]) => {
    const wrap = (opts) => (name, ...args) => fn(name, opts, ...args);
    const each = (opts) => (arr) => (name, exec) => arr.forEach((v) => fn(name?.replace('%s', v.toString()), opts, exec?.(v)));
    const globalFn = wrap({});

    globalFn.each = each({});

    ['only', 'skip', 'todo']
      .forEach((key) => {
        globalFn[key] = wrap({ [key]: true });
        globalFn.each[key] = each({ [key]: true });
      });

    globalThis[globalName] = globalFn;
  });

// a poor-man's version of expect (ease of migration)
globalThis.expect = (value) => ({
  not: {
    toBe: (other) => assert.notEqual(value, other),
    toBeDefined: () => assert.equal(value, undefined),
    toBeFalsy: () => assert.ok(value),
    toBeTruthy: () => assert.ok(!value),
    toEqual: (other) => assert.notDeepEqual(value, other),
    toHaveLength: (length) => assert.notEqual(value.length, length),
    toThrow: (message) => assert.doesNotThrow(value, { message })
  },
  toBe: (other) => assert.equal(value, other),
  toBeDefined: () => assert.notEqual(value, undefined),
  toBeFalsy: () => assert.ok(!value),
  toBeTruthy: () => assert.ok(value),
  toEqual: (other) => assert.deepEqual(value, other),
  toHaveLength: (length) => assert.equal(value.length, length),
  toThrow: (message) => assert.throws(value, { message })
});
