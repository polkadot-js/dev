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

/** @internal helper to create an umplemented error throw on use */
function unimplemented (name, key, post) {
  return () => {
    throw new Error(`${name}.${post ? `.${post}` : ''}.${key}(...) has not been implemented`);
  };
}

/** @internal just enough browser functionality for testing-library */
function createBrowser () {
  const dom = new JSDOM();
  const expose = (window) => ['crypto', 'document', 'navigator'].reduce((env, key) => ({
    ...env,
    [key]: window[key]
  }), {});

  return {
    ...expose(dom.window),
    window: dom.window
  };
}

/** @internal adjust dewscribe/it to make it jest-like */
function createSuite () {
  return Object
    .entries({ describe, it })
    .reduce((env, [key, fn]) => {
      const wrap = (opts) => (text, exec) => fn(text, opts, exec);
      const each = (opts) => (arr) => (text, exec) => arr.forEach((v, i) => fn(text?.replace('%s', v.toString()).replace('%i', i.toString()), opts, exec?.(v, i)));
      const globalFn = wrap({});

      globalFn.each = each({});

      ['only', 'skip', 'todo'].forEach((key) => {
        globalFn[key] = wrap({ [key]: true });
        globalFn.each[key] = each({ [key]: true });
      });

      return {
        ...env,
        [key]: globalFn
      };
    }, {});
}

/** @internal sets up the full test environment */
function createJest () {
  // logged via Object.keys(expect(0)).sort() (with 'not' dropped)
  const emptyMatchers = (post) => ['lastCalledWith', 'lastReturnedWith', 'nthCalledWith', 'nthReturnedWith', 'rejects', 'resolves', 'toBe', 'toBeCalled', 'toBeCalledTimes', 'toBeCalledWith', 'toBeCloseTo', 'toBeDefined', 'toBeFalsy', 'toBeGreaterThan', 'toBeGreaterThanOrEqual', 'toBeInstanceOf', 'toBeLessThan', 'toBeLessThanOrEqual', 'toBeNaN', 'toBeNull', 'toBeTruthy', 'toBeUndefined', 'toContain', 'toContainEqual', 'toEqual', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith', 'toHaveBeenLastCalledWith', 'toHaveBeenNthCalledWith', 'toHaveLastReturnedWith', 'toHaveLength', 'toHaveNthReturnedWith', 'toHaveProperty', 'toHaveReturned', 'toHaveReturnedTimes', 'toHaveReturnedWith', 'toMatch', 'toMatchInlineSnapshot', 'toMatchObject', 'toMatchSnapshot', 'toReturn', 'toReturnTimes', 'toReturnWith', 'toStrictEqual', 'toThrow', 'toThrowError', 'toThrowErrorMatchingInlineSnapshot', 'toThrowErrorMatchingSnapshot'].reduce((env, key) => ({
    ...env,
    key: unimplemented('expect(...)', key, post)
  }), {});
  const emptyJest = () => ['advanceTimersByTime', 'advanceTimersToNextTimer', 'autoMockOff', 'autoMockOn', 'clearAllMocks', 'clearAllTimers', 'createMockFromModule', 'deepUnmock', 'disableAutomock', 'doMock', 'dontMock', 'enableAutomock', 'fn', 'genMockFromModule', 'getRealSystemTime', 'getSeed', 'getTimerCount', 'isEnvironmentTornDown', 'isMockFunction', 'isolateModules', 'isolateModulesAsync', 'mock', 'mocked', 'now', 'replaceProperty', 'requireActual', 'requireMock', 'resetAllMocks', 'resetModules', 'restoreAllMocks', 'retryTimes', 'runAllImmediates', 'runAllTicks', 'runAllTimers', 'runOnlyPendingTimers', 'setMock', 'setSystemTime', 'setTimeout', 'spyOn', 'unmock', 'unstable_mockModule', 'useFakeTimers', 'useRealTimers'].reduce((env, key) => ({
    ...env,
    key: unimplemented('jest', key)
  }), {});

  // map describe/it behavior to node:test
  return {
    afterAll: after,
    afterEach,
    beforeAll: before,
    beforeEach,
    expect: (value) => ({
      ...emptyMatchers(),
      not: {
        ...emptyMatchers('not'),
        toBe: (other) => assert.notStrictEqual(value, other),
        toBeDefined: () => assert.equal(value, undefined),
        toBeFalsy: () => assert.ok(value),
        toBeTruthy: () => assert.ok(!value),
        toEqual: (other) => assert.notDeepEqual(value, other),
        toHaveLength: (length) => assert.notEqual(value.length, length),
        toThrow: (message) => assert.doesNotThrow(value, message && { message })
      },
      toBe: (other) => assert.strictEqual(value, other),
      toBeDefined: () => assert.notEqual(value, undefined),
      toBeFalsy: () => assert.ok(!value),
      toBeTruthy: () => assert.ok(value),
      toEqual: (other) => assert.deepEqual(value, other),
      toHaveLength: (length) => assert.equal(value.length, length),
      toThrow: (message) => assert.throws(value, message && { message })
    }),
    jest: { ...emptyJest() }
  };
}

// create all globals for a jest-like env
Object
  .entries(({
    ...createBrowser(),
    ...createSuite(),
    ...createJest()
  }))
  .forEach(([globalName, fn]) => {
    globalThis[globalName] = fn;
  });
