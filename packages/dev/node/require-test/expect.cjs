// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const assert = require('node:assert/strict');

const { unimplemented } = require('./util.cjs');

// logged via Object.keys(expect(0)).sort()
const KEYS = ['lastCalledWith', 'lastReturnedWith', 'not', 'nthCalledWith', 'nthReturnedWith', 'rejects', 'resolves', 'toBe', 'toBeCalled', 'toBeCalledTimes', 'toBeCalledWith', 'toBeCloseTo', 'toBeDefined', 'toBeFalsy', 'toBeGreaterThan', 'toBeGreaterThanOrEqual', 'toBeInstanceOf', 'toBeLessThan', 'toBeLessThanOrEqual', 'toBeNaN', 'toBeNull', 'toBeTruthy', 'toBeUndefined', 'toContain', 'toContainEqual', 'toEqual', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith', 'toHaveBeenLastCalledWith', 'toHaveBeenNthCalledWith', 'toHaveLastReturnedWith', 'toHaveLength', 'toHaveNthReturnedWith', 'toHaveProperty', 'toHaveReturned', 'toHaveReturnedTimes', 'toHaveReturnedWith', 'toMatch', 'toMatchInlineSnapshot', 'toMatchObject', 'toMatchSnapshot', 'toReturn', 'toReturnTimes', 'toReturnWith', 'toStrictEqual', 'toThrow', 'toThrowError', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'];

function empty (extra) {
  return KEYS.reduce((env, key) => ({
    ...env,
    key: unimplemented(`expect(...)${extra}`, key)
  }), {});
}

function isCalledWith (value, args) {
  return value?.mock?.calls.some((c) => {
    try {
      assert.deepStrictEqual(c.arguments, args);

      return true;
    } catch {
      return false;
    }
  }) || false;
}

function createToNot (value) {
  return {
    ...empty('.not'),
    toBe: (other) => assert.notStrictEqual(value, other),
    toBeDefined: () => assert.equal(value, undefined),
    toBeFalsy: () => assert.ok(value),
    toBeTruthy: () => assert.ok(!value),
    toEqual: (b) => assert.notDeepEqual(value, b),
    toHaveBeenCalled: () => assert.ok(!value?.mock?.calls.length),
    toHaveBeenCalledTimes: (n) => assert.notEqual(value?.mock?.calls.length, n),
    toHaveBeenCalledWith: (...args) => assert.ok(!isCalledWith(value, args)),
    toHaveBeenLastCalledWith: (...args) => assert.notDeepEqual(value?.mock?.calls[value?.mock?.calls.length - 1].arguments, args),
    toHaveLength: (n) => assert.notEqual(value?.length, n),
    toThrow: (message) => assert.doesNotThrow(value, message && { message })
  };
}

function createTo (value) {
  return {
    ...empty(),
    toBe: (other) => assert.strictEqual(value, other),
    toBeDefined: () => assert.notEqual(value, undefined),
    toBeFalsy: () => assert.ok(!value),
    toBeTruthy: () => assert.ok(value),
    toEqual: (b) => assert.deepEqual(value, b),
    toHaveBeenCalled: () => assert.ok(value?.mock?.calls.length),
    toHaveBeenCalledTimes: (n) => assert.equal(value?.mock?.calls.length, n),
    toHaveBeenCalledWith: (...args) => assert.ok(isCalledWith(value, args)),
    toHaveBeenLastCalledWith: (...args) => assert.deepStrictEqual(value?.mock?.calls[value?.mock?.calls.length - 1].arguments, args),
    toHaveLength: (n) => assert.equal(value?.length, n),
    toThrow: (message) => assert.throws(value, message && { message })
  };
}

/** @internal sets up the full test environment */
function getExpectKeys () {
  // map describe/it behavior to node:test
  return {
    expect: (value) => ({
      ...createTo(value),
      not: createToNot(value)
    })
  };
}

module.exports = { getExpectKeys };
