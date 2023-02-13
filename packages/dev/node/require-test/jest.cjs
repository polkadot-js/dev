// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { mock } = require('node:test');

const { enhance, unimplemented } = require('./util.cjs');

/**
 * @typedef {((...args: unknown[]) => unknown) & { mock: {} }} Spy
 **/

// logged via Object.keys(jest).sort()
const ALL_KEYS = ['advanceTimersByTime', 'advanceTimersToNextTimer', 'autoMockOff', 'autoMockOn', 'clearAllMocks', 'clearAllTimers', 'createMockFromModule', 'deepUnmock', 'disableAutomock', 'doMock', 'dontMock', 'enableAutomock', 'fn', 'genMockFromModule', 'getRealSystemTime', 'getSeed', 'getTimerCount', 'isEnvironmentTornDown', 'isMockFunction', 'isolateModules', 'isolateModulesAsync', 'mock', 'mocked', 'now', 'replaceProperty', 'requireActual', 'requireMock', 'resetAllMocks', 'resetModules', 'restoreAllMocks', 'retryTimes', 'runAllImmediates', 'runAllTicks', 'runAllTimers', 'runOnlyPendingTimers', 'setMock', 'setSystemTime', 'setTimeout', 'spyOn', 'unmock', 'unstable_mockModule', 'useFakeTimers', 'useRealTimers'];

/**
 * @internal
 *
 * This adds the mockRest and mockRestore functionality to any
 * spy or mock function
 *
 * @param {Spy} spy
 * @returns {Spy}
 **/
function extendMock (spy) {
  return enhance(spy, {
    mockReset: () => spy.mock.resetCalls(),
    mockRestore: () => spy.mock.restore()
  });
}

/**
 * Sets up the jest object. This is certainly not extensive, and probably
 * not quite meant to be (never say never). Rather this adds the functionality
 * that we use in the polkadot-js projects.
 **/
function getJestKeys () {
  return {
    jest: unimplemented('jest', ALL_KEYS, {
      fn: (fn) => extendMock(mock.fn(fn)),
      restoreAllMocks: () => mock.reset(),
      spyOn: (obj, key) => extendMock(mock.method(obj, key))
    })
  };
}

module.exports = { getJestKeys };
