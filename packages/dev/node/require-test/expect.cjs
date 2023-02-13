// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const assert = require('node:assert/strict');

const { unimplemented } = require('./util.cjs');

// logged via Object.keys(expect(0)).sort()
const ALL_KEYS = ['lastCalledWith', 'lastReturnedWith', 'not', 'nthCalledWith', 'nthReturnedWith', 'rejects', 'resolves', 'toBe', 'toBeCalled', 'toBeCalledTimes', 'toBeCalledWith', 'toBeCloseTo', 'toBeDefined', 'toBeFalsy', 'toBeGreaterThan', 'toBeGreaterThanOrEqual', 'toBeInstanceOf', 'toBeLessThan', 'toBeLessThanOrEqual', 'toBeNaN', 'toBeNull', 'toBeTruthy', 'toBeUndefined', 'toContain', 'toContainEqual', 'toEqual', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith', 'toHaveBeenLastCalledWith', 'toHaveBeenNthCalledWith', 'toHaveLastReturnedWith', 'toHaveLength', 'toHaveNthReturnedWith', 'toHaveProperty', 'toHaveReturned', 'toHaveReturnedTimes', 'toHaveReturnedWith', 'toMatch', 'toMatchInlineSnapshot', 'toMatchObject', 'toMatchSnapshot', 'toReturn', 'toReturnTimes', 'toReturnWith', 'toStrictEqual', 'toThrow', 'toThrowError', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'];

/**
 * @internal
 *
 * A helper that checks for the first instance of a match on the actual call
 * arguments (this extracts the toHaveBeenCalledWith logic)
 */
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

/**
 * @internal
 *
 * Decorates the expect.not.to* functions with the shim values
 */
function createExpectNotTo (value) {
  return unimplemented('expect(...).not', ALL_KEYS, {
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
  });
}

/**
 * @internal
 *
 * Decorates the expect.to* functions with the shim values
 */
function createExpectTo (value) {
  return unimplemented('expect(...)', ALL_KEYS, {
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
  });
}

/**
 * Sets up the shimmed expect(...) function, includding all .to* and .not.to*
 * functions. This is not comprehensive, rather is contains what we need to
 * make all polkadot-js usages pass
 **/
function getExpectKeys () {
  return {
    expect: (value) => ({
      ...createExpectTo(value),
      not: createExpectNotTo(value)
    })
  };
}

module.exports = { getExpectKeys };
