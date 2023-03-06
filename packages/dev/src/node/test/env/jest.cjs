// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

const { mock } = require('node:test');

const { enhanceObj, stubObj, warnObj } = require('../util.cjs');

/** @typedef {(...args: unknown[]) => unknown} MockFn */
/** @typedef {{ mockImplementation: (fn: MockFn) => unknown; mockImplementationOnce: (fn: MockFn) => unknown; resetCalls: () => void; restore: () => void }} Mock */
/** @typedef {MockFn & { mock: Mock }} Spy */

// logged via Object.keys(jest).sort()
const JEST_KEYS = ['advanceTimersByTime', 'advanceTimersToNextTimer', 'autoMockOff', 'autoMockOn', 'clearAllMocks', 'clearAllTimers', 'createMockFromModule', 'deepUnmock', 'disableAutomock', 'doMock', 'dontMock', 'enableAutomock', 'fn', 'genMockFromModule', 'getRealSystemTime', 'getSeed', 'getTimerCount', 'isEnvironmentTornDown', 'isMockFunction', 'isolateModules', 'isolateModulesAsync', 'mock', 'mocked', 'now', 'replaceProperty', 'requireActual', 'requireMock', 'resetAllMocks', 'resetModules', 'restoreAllMocks', 'retryTimes', 'runAllImmediates', 'runAllTicks', 'runAllTimers', 'runOnlyPendingTimers', 'setMock', 'setSystemTime', 'setTimeout', 'spyOn', 'unmock', 'unstable_mockModule', 'useFakeTimers', 'useRealTimers'];

// logged via Object.keys(jest.fn()).sort()
const MOCK_KEYS = ['_isMockFunction', 'getMockImplementation', 'getMockName', 'mock', 'mockClear', 'mockImplementation', 'mockImplementationOnce', 'mockName', 'mockRejectedValue', 'mockRejectedValueOnce', 'mockReset', 'mockResolvedValue', 'mockResolvedValueOnce', 'mockRestore', 'mockReturnThis', 'mockReturnValue', 'mockReturnValueOnce', 'withImplementation'];

const jestStub = stubObj('jest', JEST_KEYS);
const jestWarn = warnObj('jest', ['setTimeout']);
const mockStub = stubObj('jest.fn()', MOCK_KEYS);

/**
 * @internal
 *
 * This adds the mockReset and mockRestore functionality to any
 * spy or mock function
 *
 * @param {Spy} spy
 * @returns {Spy}
 **/
function extendMock (spy) {
  return enhanceObj(spy, {
    mockImplementation: (fn) => spy.mock.mockImplementation(fn),
    mockImplementationOnce: (fn) => spy.mock.mockImplementationOnce(fn),
    mockReset: () => spy.mock.resetCalls(),
    mockRestore: () => spy.mock.restore()
  }, mockStub);
}

/**
 * Sets up the jest object. This is certainly not extensive, and probably
 * not quite meant to be (never say never). Rather this adds the functionality
 * that we use in the polkadot-js projects.
 **/
function jest () {
  return {
    jest: enhanceObj({
      fn: (fn) => extendMock(mock.fn(fn)),
      restoreAllMocks: () => mock.reset(),
      spyOn: (obj, key) => extendMock(mock.method(obj, key))
    }, jestWarn, jestStub)
  };
}

module.exports = { jest };
