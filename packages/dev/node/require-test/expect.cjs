// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const assert = require('node:assert/strict');

const { enhance, unimplemented } = require('./util.cjs');

/**
 * @typedef {(other: unknown) => boolean} ExpectMatchFn
 * @typedef {{ __isMatcher: boolean, match: MatchFn }} ExpectMatcher
 */

// FIXME The following expect functions have been found as unimplemented in
// the polkadot-js/common repo:
//
// - error: 'expect.objectContaining is not a function'

// logged via Object.keys(expect(0)).sort()
const INS_KEYS = ['lastCalledWith', 'lastReturnedWith', 'not', 'nthCalledWith', 'nthReturnedWith', 'rejects', 'resolves', 'toBe', 'toBeCalled', 'toBeCalledTimes', 'toBeCalledWith', 'toBeCloseTo', 'toBeDefined', 'toBeFalsy', 'toBeGreaterThan', 'toBeGreaterThanOrEqual', 'toBeInstanceOf', 'toBeLessThan', 'toBeLessThanOrEqual', 'toBeNaN', 'toBeNull', 'toBeTruthy', 'toBeUndefined', 'toContain', 'toContainEqual', 'toEqual', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith', 'toHaveBeenLastCalledWith', 'toHaveBeenNthCalledWith', 'toHaveLastReturnedWith', 'toHaveLength', 'toHaveNthReturnedWith', 'toHaveProperty', 'toHaveReturned', 'toHaveReturnedTimes', 'toHaveReturnedWith', 'toMatch', 'toMatchInlineSnapshot', 'toMatchObject', 'toMatchSnapshot', 'toReturn', 'toReturnTimes', 'toReturnWith', 'toStrictEqual', 'toThrow', 'toThrowError', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'];

// logged via Object.keys(expect).sort()
const OBJ_KEYS = ['addEqualityTesters', 'addSnapshotSerializer', 'any', 'anything', 'arrayContaining', 'assertions', 'closeTo', 'extend', 'extractExpectedAssertionsErrors', 'getState', 'hasAssertions', 'not', 'objectContaining', 'setState', 'stringContaining', 'stringMatching', 'toMatchInlineSnapshot', 'toMatchSnapshot', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'];

/**
 * @internal
 *
 * A helper that wraps a maching function in an ExpectMatcher. This is (currently)
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
 * An example of macther use can be seen in the isCalledWith loops
 *
 * @param {ExpectMatchFn} match
 * @returns {(obj: unknown) => ExpectMatcher}
 */
function createMatcher (match) {
  return {
    __isMatcher: true,
    match
  };
}

/**
 * @internal
 *
 * A helper that checks a single call arguments, which may include the
 * use of matchers. This is used in finding any call or checking a specific
 * call
 *
 * @param {unknown[]} maches
 * @param {{ arguments: unknown[] }} [call]
 * @returns {boolean}
 */
function singleCallHasArgs (args, call) {
  assert.ok(call && args.length === call.arguments?.length, 'Number of arguments does not match');

  args.every((arg, i) => {
    arg !== null && typeof arg === 'object' && arg.__isMatcher
      ? arg.match(call.arguments[i])
      : assert.deepStrictEqual(call.arguments[i], arg);

    return true;
  });

  return true;
}

/**
 * @internal
 *
 * A helper that checks for the first instance of a match on the actual call
 * arguments (this extracts the toHaveBeenCalledWith logic)
 */
function anyCallHasArgs (value, args) {
  return value?.mock?.calls.some((call) => {
    try {
      return singleCallHasArgs(args, call);
    } catch (error) {
      return false;
    }
  }) || false;
}

/**
 * @internal
 *
 * A helper to match the supplied fields against the resulting object
 */
function matchObj (match, value) {
  Object
    .entries(match)
    .forEach(([k, v]) => assert.deepStrictEqual(v, value[k]));

  return true;
}

/**
 * @internal
 *
 * Decorates the expect.not.to* functions with the shim values
 */
function createExpectNotTo (value) {
  return unimplemented('expect(...).not', INS_KEYS, {
    toBe: (other) => assert.notStrictEqual(value, other),
    toBeDefined: () => assert.equal(value, undefined),
    toBeFalsy: () => assert.ok(value),
    toBeTruthy: () => assert.ok(!value),
    toEqual: (b) => assert.notDeepEqual(value, b),
    toHaveBeenCalled: () => assert.ok(!value?.mock?.calls.length),
    toHaveBeenCalledTimes: (n) => assert.notEqual(value?.mock?.calls.length, n),
    toHaveBeenCalledWith: (...args) => assert.ok(!anyCallHasArgs(value, args)),
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
  return unimplemented('expect(...)', INS_KEYS, {
    toBe: (other) => assert.strictEqual(value, other),
    toBeDefined: () => assert.notEqual(value, undefined),
    toBeFalsy: () => assert.ok(!value),
    toBeTruthy: () => assert.ok(value),
    toEqual: (b) => assert.deepEqual(value, b),
    toHaveBeenCalled: () => assert.ok(value?.mock?.calls.length),
    toHaveBeenCalledTimes: (n) => assert.equal(value?.mock?.calls.length, n),
    toHaveBeenCalledWith: (...args) => assert.ok(anyCallHasArgs(value, args)),
    toHaveBeenLastCalledWith: (...args) => assert.ok(singleCallHasArgs(args, value?.mock?.calls[value?.mock?.calls.length - 1])),
    toHaveLength: (n) => assert.equal(value?.length, n),
    toMatchObject: (obj) => assert.ok(matchObj(obj, value)),
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
    expect: unimplemented('expect', OBJ_KEYS, enhance(
      (value) => ({
        ...createExpectTo(value),
        not: createExpectNotTo(value)
      }),
      {
        objectContaining: (check) => createMatcher((value) => Object.entries(check).every(([k, v]) => assert.deepStrictEqual(v, value?.[k]))),
        stringMatching: (regExOrStr) => createMatcher((value) => assert.ok(typeof regExOrStr === 'string' ? value.includes(regExOrStr) : value.match(regExOrStr)))
      }
    ))
  };
}

module.exports = { getExpectKeys };
