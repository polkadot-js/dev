// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// This allows for compatibility with Jest environments using
// describe, it, test ...
//
// NOTE: node --require only works with commonjs files, hence using it here
// NOTE: --import was added in Node 19 that would simplify, but too early

const { JSDOM } = require('jsdom');
const assert = require('node:assert/strict');
const { after, afterEach, before, beforeEach, describe, it, mock } = require('node:test');

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
      const each = (opts) => (arr) => (text, exec) => arr.forEach((v, i) => fn(text?.replace('%s', v.toString()).replace('%i', i.toString()).replace('%p', JSON.stringify(v)), opts, exec?.(v, i)));
      const globalFn = wrap({});

      // unlike only/skip/todo these are a jest-only exptension
      globalFn.each = each({});

      // These are the real reason we have this wrapping - however they
      // _are_ being added to the test:node core, so can be removed soon-ish
      // (Support is very spotty on at least node 18)
      //
      // See https://github.com/nodejs/node/pull/46604
      ['only', 'skip', 'todo'].forEach((opt) => {
        globalFn[opt] = wrap({ [opt]: true });
        globalFn.each[opt] = each({ [opt]: true });
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

  const calledWith = (value, args) =>
    value?.mock?.calls.some((c) => {
      try {
        assert.deepStrictEqual(c.arguments, args);

        return true;
      } catch {
        console.error('not called with', args, c.arguments);

        return false;
      }
    });

  const expect = (value) => ({
    ...emptyMatchers(),
    not: {
      ...emptyMatchers('not'),
      toBe: (other) => assert.notStrictEqual(value, other),
      toBeDefined: () => assert.equal(value, undefined),
      toBeFalsy: () => assert.ok(value),
      toBeTruthy: () => assert.ok(!value),
      toEqual: (b) => assert.notDeepEqual(value, b),
      toHaveBeenCalled: () => assert.ok(!value?.mock?.calls.length),
      toHaveBeenCalledTimes: (n) => assert.notEqual(value?.mock?.calls.length, n),
      toHaveBeenCalledWith: (...args) => assert.ok(!calledWith(value, args)),
      toHaveBeenLastCalledWith: (...args) => assert.notDeepEqual(value?.mock?.calls[value?.mock?.calls.length - 1].arguments, args),
      toHaveLength: (n) => assert.notEqual(value?.length, n),
      toThrow: (message) => assert.doesNotThrow(value, message && { message })
    },
    toBe: (other) => assert.strictEqual(value, other),
    toBeDefined: () => assert.notEqual(value, undefined),
    toBeFalsy: () => assert.ok(!value),
    toBeTruthy: () => assert.ok(value),
    toEqual: (b) => assert.deepEqual(value, b),
    toHaveBeenCalled: () => assert.ok(value?.mock?.calls.length),
    toHaveBeenCalledTimes: (n) => assert.equal(value?.mock?.calls.length, n),
    toHaveBeenCalledWith: (...args) => assert.ok(calledWith(value, args)),
    toHaveBeenLastCalledWith: (...args) => assert.deepStrictEqual(value?.mock?.calls[value?.mock?.calls.length - 1].arguments, args),
    toHaveLength: (n) => assert.equal(value?.length, n),
    toThrow: (message) => assert.throws(value, message && { message })
  });

  const jest = {
    ...emptyJest(),
    fn: (fn) => mock.fn(fn)
  };

  // map describe/it behavior to node:test
  return {
    afterAll: after,
    afterEach,
    beforeAll: before,
    beforeEach,
    expect,
    jest
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
    global[globalName] = fn;
  });
