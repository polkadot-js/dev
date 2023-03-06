// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

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
const stubExpectFn = stubObj('expect(...)', EXPECT_KEYS_FN, {
  toThrowError: 'expect(...).toThrow'
});
const stubExpectFnRejects = stubObj('expect(...).rejects', EXPECT_KEYS_FN, {
  toThrowError: 'expect(...).rejects.toThrow'
});
const stubExpectFnResolves = stubObj('expect(...).resolves', EXPECT_KEYS_FN);
const stubExpectFnNot = stubObj('expect(...).not', EXPECT_KEYS_FN, {
  toBeFalsy: 'expect(...).toBeTruthy',
  toBeTruthy: 'expect(...).toBeFalsy',
  toThrowError: 'expect(...).not.toThrow'
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

  /**
   * @param {(value: any, check: any) => void} assertFn
   * @param {unknown} [check]
   **/
  constructor (assertFn, check) {
    this.assertMatch = (value) => assertFn(value, check);
  }
}

/**
 * @internal
 *
 * Asserts that the input value is non-nullish
 *
 * @param {unknown} value
 */
function assertNonNullish (value) {
  assert.ok(value !== null && value !== undefined, `Expected non-nullish value, found ${value}`);
}

/**
 * @internal
 *
 * A helper that checks a single call arguments, which may include the
 * use of matchers. This is used in finding any call or checking a specific
 * call
 *
 * @param {{ arguments: unknown[] } | undefined} call
 * @param {unknown[]} args
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
 * Asserts that the value is either (equal deep) or matches the matcher (if supplied)
 *
 * @param {unknown} value
 * @param {Matcher | unknown} check
 */
function assertMatch (value, check) {
  check instanceof Matcher
    ? check.assertMatch(value)
    : Array.isArray(check)
      ? assertMatchArr(value, check)
      : check && typeof check === 'object'
        ? assertMatchObj(value, check)
        : assert.deepStrictEqual(value, check);
}

/**
 * @internal
 *
 * A helper to match the supplied array check against the resulting array
 *
 * @param {unknown} value
 * @param {unknown[]} check
 */
function assertMatchArr (value, check) {
  assert.ok(value && Array.isArray(value), `Expected array value, found ${typeof value}`);
  assert.ok(value.length === check.length, `Expected array with ${check.length} entries, found ${value.length}`);

  check.forEach((other, i) => assertMatch(value[i], other));
}

/**
 * @internal
 *
 * A helper to match the supplied fields against the resulting object
 *
 * @param {object} value
 * @param {object} check
 */
function assertMatchObj (value, check) {
  assert.ok(value && typeof value === 'object', `Expected object value, found ${typeof value}`);

  Object
    .entries(check)
    .forEach(([key, other]) => assertMatch(value[key], other));
}

/**
 * @internal
 *
 * A helper to match a string value against another string or regex
 *
 * @param {string} value
 * @param {string | RegExp} check
 */
function assertMatchStr (value, check) {
  assert.ok(typeof value === 'string', `Expected string value, found ${typeof value}`);

  typeof check === 'string'
    ? assert.strictEqual(value, check)
    : assert.match(value, check);
}

/**
 * @internal
 *
 * A helper to check the type of a specific value as used in the expect.any(Clazz) matcher
 *
 * @see https://github.com/facebook/jest/blob/a49c88610e49a3242576160740a32a2fe11161e1/packages/expect/src/asymmetricMatchers.ts#L103-L133
 *
 * @param {unknown} value
 * @param {Object} value
 */
function assertInstanceOf (value, Clazz) {
  assert.ok(
    (Clazz === Array && Array.isArray(value)) ||
    (Clazz === BigInt && typeof value === 'bigint') ||
    (Clazz === Boolean && typeof value === 'boolean') ||
    (Clazz === Function && typeof value === 'function') ||
    (Clazz === Number && typeof value === 'number') ||
    (Clazz === Object && typeof value === 'object') ||
    (Clazz === String && typeof value === 'string') ||
    (Clazz === Symbol && typeof value === 'symbol') ||
    (value instanceof Clazz),
    `${value} is not an instance of ${Clazz.name}`
  );
}

/**
 * @internal
 *
 * A helper to ensure that the supplied string/array does include the checker string.
 *
 * @param {string | unknown[]} value
 * @param {string} check
 */
function assertIncludes (value, [check, Clazz]) {
  assertInstanceOf(value, Clazz);
  assert.ok(value?.includes(check), `${value} does not include ${check}`);
}

/**
 * Sets up the shimmed expect(...) function, includding all .to* and .not.to*
 * functions. This is not comprehensive, rather is contains what we need to
 * make all polkadot-js usages pass
 **/
function expect () {
  return {
    expect: enhanceObj(
      (value) => enhanceObj({
        not: enhanceObj({
          toBe: (other) => assert.notStrictEqual(value, other),
          toBeDefined: () => assert.ok(value === undefined),
          toBeNull: (value) => assert.ok(value !== null),
          toBeUndefined: () => assert.ok(value !== undefined),
          toEqual: (other) => assert.notDeepEqual(value, other),
          toHaveBeenCalled: () => assert.ok(!value?.mock?.calls.length),
          toThrow: (message) => assert.doesNotThrow(value, message && { message })
        }, stubExpectFnNot),
        rejects: enhanceObj({
          toThrow: (message) => assert.rejects(value, message)
        }, stubExpectFnRejects),
        resolves: enhanceObj({}, stubExpectFnResolves),
        toBe: (other) => assert.strictEqual(value, other),
        toBeDefined: () => assert.ok(value !== undefined),
        toBeFalsy: () => assert.ok(!value),
        toBeInstanceOf: (Clazz) => assertInstanceOf(value, Clazz),
        toBeNull: (value) => assert.ok(value === null),
        toBeTruthy: () => assert.ok(value),
        toBeUndefined: () => assert.ok(value === undefined),
        toEqual: (other) => assert.deepEqual(value, other),
        toHaveBeenCalled: () => assert.ok(value?.mock?.calls.length),
        toHaveBeenCalledTimes: (count) => assert.equal(value?.mock?.calls.length, count),
        toHaveBeenCalledWith: (...args) => assertSomeCallHasArgs(value, args),
        toHaveBeenLastCalledWith: (...args) => assertCallHasArgs(value?.mock?.calls.at(-1), args),
        toHaveLength: (length) => assert.equal(value?.length, length),
        toMatch: (check) => assertMatchStr(value, check),
        toMatchObject: (check) => assertMatchObj(value, check),
        toThrow: (message) => assert.throws(value, message && { message })
      }, stubExpectFn),
      {
        any: (Clazz) => new Matcher(assertInstanceOf, Clazz),
        anything: () => new Matcher(assertNonNullish),
        arrayContaining: (check) => new Matcher(assertIncludes, [check, Array]),
        objectContaining: (check) => new Matcher(assertMatchObj, check),
        stringContaining: (check) => new Matcher(assertIncludes, [check, String]),
        stringMatching: (check) => new Matcher(assertMatchStr, check)
      },
      stubExpect
    )
  };
}

module.exports = { expect };
