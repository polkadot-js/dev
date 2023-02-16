// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const assert = require('node:assert/strict');

const { enhanceObj, stubObj } = require('../util.cjs');

/**
 * @typedef {(value: unknown) => void} AssertMatchFn
 */

// logged via Object.keys(expect).sort()
const EXPECT_KEYS = ['addEqualityTesters', 'addSnapshotSerializer', 'any', 'anything', 'arrayContaining', 'assertions', 'closeTo', 'extend', 'extractExpectedAssertionsErrors', 'getState', 'hasAssertions', 'not', 'objectContaining', 'setState', 'stringContaining', 'stringMatching', 'toMatchInlineSnapshot', 'toMatchSnapshot', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'];

// logged via Object.keys(expect(0)).sort()
const EXPECT_KEYS_FN = ['lastCalledWith', 'lastReturnedWith', 'not', 'nthCalledWith', 'nthReturnedWith', 'rejects', 'resolves', 'toBe', 'toBeCalled', 'toBeCalledTimes', 'toBeCalledWith', 'toBeCloseTo', 'toBeDefined', 'toBeFalsy', 'toBeGreaterThan', 'toBeGreaterThanOrEqual', 'toBeInstanceOf', 'toBeLessThan', 'toBeLessThanOrEqual', 'toBeNaN', 'toBeNull', 'toBeTruthy', 'toBeUndefined', 'toContain', 'toContainEqual', 'toEqual', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith', 'toHaveBeenLastCalledWith', 'toHaveBeenNthCalledWith', 'toHaveLastReturnedWith', 'toHaveLength', 'toHaveNthReturnedWith', 'toHaveProperty', 'toHaveReturned', 'toHaveReturnedTimes', 'toHaveReturnedWith', 'toMatch', 'toMatchInlineSnapshot', 'toMatchObject', 'toMatchSnapshot', 'toReturn', 'toReturnTimes', 'toReturnWith', 'toStrictEqual', 'toThrow', 'toThrowError', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'];

const stubExpect = stubObj('expect', EXPECT_KEYS);
const stubExpectFn = stubObj('expect(...)', EXPECT_KEYS_FN);
const stubExpectFnNot = stubObj('expect(...).not', EXPECT_KEYS_FN, {
  toBeFalsy: 'expect(...).toBeTruthy',
  toBeTruthy: 'expect(...).toBeFalsy'
});

/**
 * @internal
 *
 * A helper that wraps a matching function in an ExpectMatcher. This is (currently)
 * only used/checked for in the calledWith* helpers
 *
 * TODO We don't use it in polkadot-js, but a useful enhancement could be for
 * any of the to* expectations to detect and use those. An example of useful code
 * in that case:
 *
 * ```js
 * expect({
 *   a: 'blah',
 *   b: 3
 * }).toEqual(
 *   expect.objectContaining({ b: 3 })
 * )
 * ```
 *
 * An example of matcher use can be seen in the isCalledWith loops
 */
class Matcher {
  /** @type AssertMatchFn */
  assertMatch;

  /** @param {AssertMatchFn} assertMatch */
  constructor (assertMatch) {
    this.assertMatch = assertMatch;
  }
}

/**
 * @internal
 *
 * Asserts that the value is either (equal deep) or matches the matcher (if supplied)
 *
 * @param {unknown} value
 * @param {Macther | unknown} check
 */
function assertMatch (value, check) {
  check instanceof Matcher
    ? check.assertMatch(value)
    : assert.deepStrictEqual(value, check);
}

/**
 * @internal
 *
 * A helper that checks a single call arguments, which may include the
 * use of matchers. This is used in finding any call or checking a specific
 * call
 *
 * @param {{ arguments: unknown[] }} [call]
 * @param {unknown[]} args
 * @returns {boolean}
 */
function assertCallHasArgs (call, args) {
  assert.ok(call && args.length === call.arguments?.length, 'Number of arguments does not match');

  args.forEach((arg, i) => assertMatch(call.arguments[i], arg));
}

/**
 * @internal
 *
 * A helper that checks for the first instance of a match on the actual call
 * arguments (this extracts the toHaveBeenCalledWith logic)
 */
function assertSomeCallHasArgs (value, args) {
  assert.ok(value?.mock?.calls.some((call) => {
    try {
      assertCallHasArgs(call, args);

      return true;
    } catch {
      return false;
    }
  }), 'No call found matching arguments');
}

/**
 * @internal
 *
 * A helper to match the supplied fields against the resulting object
 *
 * @param {object} value
 * @param {object} check
 */
function assertObjMatches (value, check) {
  assert.ok(value && typeof value === 'object', `Cannot match object. Expected object value, found ${typeof value}`);

  Object
    .entries(check)
    .forEach(([key, other]) => assertMatch(value?.[key], other));
}

/**
 * @internal
 *
 * A helper to match a string value against another string or regex
 *
 * @param {string} value
 * @param {string | RegEx} check
 */
function assertStrMatches (value, check) {
  assert.ok(typeof value === 'string', `Cannot match string. Expected string value, found ${typeof value}`);

  typeof check === 'string'
    ? assert.strictEqual(value, check)
    : assert.match(value, check);
}

/**
 * @internal
 *
 * Decorates the expect(...).to* functions with the shim values
 *
 * @returns {(value: unknown) => Record<string, (...args: unknown[]) => unknown>}
 */
function createExpectFn () {
  return (value) => enhanceObj({
    not: enhanceObj({
      toBe: (other) => assert.notStrictEqual(value, other),
      toBeDefined: () => assert.equal(value, undefined),
      toEqual: (other) => assert.notDeepEqual(value, other),
      toHaveBeenCalled: () => assert.ok(!value?.mock?.calls.length),
      toThrow: (message) => assert.doesNotThrow(value, message && { message })
    }, stubExpectFnNot),
    toBe: (other) => assert.strictEqual(value, other),
    toBeDefined: () => assert.notEqual(value, undefined),
    toBeFalsy: () => assert.ok(!value),
    toBeTruthy: () => assert.ok(value),
    toEqual: (other) => assert.deepEqual(value, other),
    toHaveBeenCalled: () => assert.ok(value?.mock?.calls.length),
    toHaveBeenCalledTimes: (count) => assert.equal(value?.mock?.calls.length, count),
    toHaveBeenCalledWith: (...args) => assertSomeCallHasArgs(value, args),
    toHaveBeenLastCalledWith: (...args) => assertCallHasArgs(value?.mock?.calls.at(-1), args),
    toHaveLength: (length) => assert.equal(value?.length, length),
    toMatch: (check) => assertStrMatches(value, check),
    toMatchObject: (check) => assertObjMatches(value, check),
    toThrow: (message) => assert.throws(value, message && { message })
  }, stubExpectFn);
}

/**
 * Sets up the shimmed expect(...) function, includding all .to* and .not.to*
 * functions. This is not comprehensive, rather is contains what we need to
 * make all polkadot-js usages pass
 **/
function expect () {
  return {
    expect: enhanceObj(
      createExpectFn(),
      {
        objectContaining: (check) => new Matcher((value) => assertObjMatches(value, check)),
        stringMatching: (check) => new Matcher((value) => assertStrMatches(value, check))
      },
      stubExpect
    )
  };
}

module.exports = { expect };
