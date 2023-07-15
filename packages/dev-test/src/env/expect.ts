// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AnyFn, WithMock } from '../types.js';

import { strict as assert } from 'node:assert';

import { enhanceObj, stubObj } from '../util.js';

type AssertMatchFn = (value: unknown) => void;

type Mocked = Partial<WithMock<AnyFn>>;

// logged via Object.keys(expect).sort()
const EXPECT_KEYS = ['addEqualityTesters', 'addSnapshotSerializer', 'any', 'anything', 'arrayContaining', 'assertions', 'closeTo', 'extend', 'extractExpectedAssertionsErrors', 'getState', 'hasAssertions', 'not', 'objectContaining', 'setState', 'stringContaining', 'stringMatching', 'toMatchInlineSnapshot', 'toMatchSnapshot', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'] as const;

// logged via Object.keys(expect(0)).sort()
const EXPECT_KEYS_FN = ['lastCalledWith', 'lastReturnedWith', 'not', 'nthCalledWith', 'nthReturnedWith', 'rejects', 'resolves', 'toBe', 'toBeCalled', 'toBeCalledTimes', 'toBeCalledWith', 'toBeCloseTo', 'toBeDefined', 'toBeFalsy', 'toBeGreaterThan', 'toBeGreaterThanOrEqual', 'toBeInstanceOf', 'toBeLessThan', 'toBeLessThanOrEqual', 'toBeNaN', 'toBeNull', 'toBeTruthy', 'toBeUndefined', 'toContain', 'toContainEqual', 'toEqual', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith', 'toHaveBeenLastCalledWith', 'toHaveBeenNthCalledWith', 'toHaveLastReturnedWith', 'toHaveLength', 'toHaveNthReturnedWith', 'toHaveProperty', 'toHaveReturned', 'toHaveReturnedTimes', 'toHaveReturnedWith', 'toMatch', 'toMatchInlineSnapshot', 'toMatchObject', 'toMatchSnapshot', 'toReturn', 'toReturnTimes', 'toReturnWith', 'toStrictEqual', 'toThrow', 'toThrowError', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'] as const;

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
  assertMatch: AssertMatchFn;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor (assertFn: (value: any, check: any) => void, check?: unknown) {
    this.assertMatch = (value) => assertFn(value, check);
  }
}

/**
 * @internal
 *
 * Asserts that the input value is non-nullish
 */
function assertNonNullish (value: unknown): void {
  assert.ok(value !== null && value !== undefined, `Expected non-nullish value, found ${value as string}`);
}

/**
 * @internal
 *
 * A helper that checks a single call arguments, which may include the
 * use of matchers. This is used in finding any call or checking a specific
 * call
 */
function assertCallHasArgs (call: { arguments: unknown[] } | undefined, args: unknown[]): void {
  assert.ok(call && args.length === call.arguments?.length, 'Number of arguments does not match');

  args.forEach((arg, i) => assertMatch(call.arguments[i], arg));
}

/**
 * @internal
 *
 * A helper that checks for the first instance of a match on the actual call
 * arguments (this extracts the toHaveBeenCalledWith logic)
 */
function assertSomeCallHasArgs (value: Mocked | undefined, args: unknown[]) {
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
 */
function assertMatch (value: unknown, check: unknown): void {
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
function assertMatchArr (value: unknown, check: unknown[]): void {
  assert.ok(value && Array.isArray(value), `Expected array value, found ${typeof value}`);
  assert.ok(value.length === check.length, `Expected array with ${check.length} entries, found ${value.length}`);

  check.forEach((other, i) => assertMatch(value[i], other));
}

/**
 * @internal
 *
 * A helper to match the supplied fields against the resulting object
 */
function assertMatchObj (value: unknown, check: object): void {
  assert.ok(value && typeof value === 'object', `Expected object value, found ${typeof value}`);

  Object
    .entries(check)
    .forEach(([key, other]) => assertMatch((value as Record<string, unknown>)[key], other));
}

/**
 * @internal
 *
 * A helper to match a string value against another string or regex
 */
function assertMatchStr (value: unknown, check: string | RegExp): void {
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
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function assertInstanceOf (value: unknown, Clazz: Function): void {
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
    `${value as string} is not an instance of ${Clazz.name}`
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
// eslint-disable-next-line @typescript-eslint/ban-types
function assertIncludes (value: string | unknown[], [check, Clazz]: [string, Function]): void {
  assertInstanceOf(value, Clazz);
  assert.ok(value?.includes(check), `${value as string} does not include ${check}`);
}

/**
 * Sets up the shimmed expect(...) function, including all .to* and .not.to*
 * functions. This is not comprehensive, rather is contains what we need to
 * make all polkadot-js usages pass
 **/
export function expect () {
  const rootMatchers = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    any: (Clazz: Function) => new Matcher(assertInstanceOf, Clazz),
    anything: () => new Matcher(assertNonNullish),
    arrayContaining: (check: string) => new Matcher(assertIncludes, [check, Array]),
    objectContaining: (check: object) => new Matcher(assertMatchObj, check),
    stringContaining: (check: string) => new Matcher(assertIncludes, [check, String]),
    stringMatching: (check: string | RegExp) => new Matcher(assertMatchStr, check)
  };

  return {
    expect: enhanceObj(enhanceObj((value: unknown) =>
      enhanceObj({
        not: enhanceObj({
          toBe: (other: unknown) => assert.notStrictEqual(value, other),
          toBeDefined: () => assert.ok(value === undefined),
          toBeNull: (value: unknown) => assert.ok(value !== null),
          toBeUndefined: () => assert.ok(value !== undefined),
          toEqual: (other: unknown) => assert.notDeepEqual(value, other),
          toHaveBeenCalled: () => assert.ok(!(value as Mocked | undefined)?.mock?.calls.length),
          toThrow: (message?: RegExp | Error | string) => assert.doesNotThrow(value as () => unknown, message && { message } as Error)
        }, stubExpectFnNot),
        rejects: enhanceObj({
          toThrow: (message?: RegExp | Error | string) => assert.rejects(value as Promise<unknown>, message && { message } as Error)
        }, stubExpectFnRejects),
        resolves: enhanceObj({}, stubExpectFnResolves),
        toBe: (other: unknown) => assert.strictEqual(value, other),
        toBeDefined: () => assert.ok(value !== undefined),
        toBeFalsy: () => assert.ok(!value),
        // eslint-disable-next-line @typescript-eslint/ban-types
        toBeInstanceOf: (Clazz: Function) => assertInstanceOf(value, Clazz),
        toBeNull: (value: unknown) => assert.ok(value === null),
        toBeTruthy: () => assert.ok(value),
        toBeUndefined: () => assert.ok(value === undefined),
        toEqual: (other: unknown) => assert.deepEqual(value, other),
        toHaveBeenCalled: () => assert.ok((value as Mocked | undefined)?.mock?.calls.length),
        toHaveBeenCalledTimes: (count: number) => assert.equal((value as Mocked | undefined)?.mock?.calls.length, count),
        toHaveBeenCalledWith: (...args: unknown[]) => assertSomeCallHasArgs((value as Mocked | undefined), args),
        toHaveBeenLastCalledWith: (...args: unknown[]) => assertCallHasArgs((value as Mocked | undefined)?.mock?.calls.at(-1), args),
        toHaveLength: (length: number) => assert.equal((value as unknown[] | undefined)?.length, length),
        toMatch: (check: string | RegExp) => assertMatchStr(value, check),
        toMatchObject: (check: object) => assertMatchObj(value, check),
        toThrow: (message?: RegExp | Error | string) => assert.throws(value as () => unknown, message && { message } as Error)
      }, stubExpectFn), rootMatchers), stubExpect)
  };
}
