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

// empty jest matcher (just allows us to indicate where we have gaps)
function emptyExpect (pre) {
  // logged via Object.keys(expect(0)).sort() (with 'not' dropped)
  ['lastCalledWith', 'lastReturnedWith', 'nthCalledWith', 'nthReturnedWith', 'rejects', 'resolves', 'toBe', 'toBeCalled', 'toBeCalledTimes', 'toBeCalledWith', 'toBeCloseTo', 'toBeDefined', 'toBeFalsy', 'toBeGreaterThan', 'toBeGreaterThanOrEqual', 'toBeInstanceOf', 'toBeLessThan', 'toBeLessThanOrEqual', 'toBeNaN', 'toBeNull', 'toBeTruthy', 'toBeUndefined', 'toContain', 'toContainEqual', 'toEqual', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith', 'toHaveBeenLastCalledWith', 'toHaveBeenNthCalledWith', 'toHaveLastReturnedWith', 'toHaveLength', 'toHaveNthReturnedWith', 'toHaveProperty', 'toHaveReturned', 'toHaveReturnedTimes', 'toHaveReturnedWith', 'toMatch', 'toMatchInlineSnapshot', 'toMatchObject', 'toMatchSnapshot', 'toReturn', 'toReturnTimes', 'toReturnWith', 'toStrictEqual', 'toThrow', 'toThrowError', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'].reduce((all, key) => ({
    ...all,
    key: () => {
      throw new Error(`expect(...)${pre ? `.${pre}` : ''}.${key}(...) not implemented`);
    }
  }), {});
}

// pin-point globals, i.e. available functions
Object
  .entries(({
    // browser environment via JSDOM
    ...['crypto', 'document', 'navigator'].reduce((env, k) => ({ ...env, [k]: dom.window[k] }), { window: dom.window }),
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
    const wrap = (opts) => (text, exec) => fn(text, opts, exec);
    const each = (opts) => (arr) => (text, exec) => arr.forEach((v, i) => fn(text?.replace('%s', v.toString()).replace('%i', i.toString()), opts, exec?.(v, i)));
    const globalFn = wrap({});

    globalFn.each = each({});

    ['only', 'skip', 'todo'].forEach((key) => {
      globalFn[key] = wrap({ [key]: true });
      globalFn.each[key] = each({ [key]: true });
    });

    globalThis[globalName] = globalFn;
  });

// a poor-man's version of expect (ease of migration)
globalThis.expect = (value) => ({
  ...emptyExpect(),
  not: {
    ...emptyExpect('not'),
    toBe: (other) => assert.notStrictEqual(value, other),
    toBeDefined: () => assert.equal(value, undefined),
    toBeFalsy: () => assert.ok(value),
    toBeTruthy: () => assert.ok(!value),
    toEqual: (other) => assert.notDeepEqual(value, other),
    toHaveLength: (length) => assert.notEqual(value.length, length),
    toThrow: (message) => assert.doesNotThrow(value, { message })
  },
  toBe: (other) => assert.strictEqual(value, other),
  toBeDefined: () => assert.notEqual(value, undefined),
  toBeFalsy: () => assert.ok(!value),
  toBeTruthy: () => assert.ok(value),
  toEqual: (other) => assert.deepEqual(value, other),
  toHaveLength: (length) => assert.equal(value.length, length),
  toThrow: (message) => assert.throws(value, { message })
});
