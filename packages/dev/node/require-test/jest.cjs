// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { mock } = require('node:test');

const { unimplemented } = require('./util.cjs');

// logged via Object.keys(jest).sort()
const KEYS = ['advanceTimersByTime', 'advanceTimersToNextTimer', 'autoMockOff', 'autoMockOn', 'clearAllMocks', 'clearAllTimers', 'createMockFromModule', 'deepUnmock', 'disableAutomock', 'doMock', 'dontMock', 'enableAutomock', 'fn', 'genMockFromModule', 'getRealSystemTime', 'getSeed', 'getTimerCount', 'isEnvironmentTornDown', 'isMockFunction', 'isolateModules', 'isolateModulesAsync', 'mock', 'mocked', 'now', 'replaceProperty', 'requireActual', 'requireMock', 'resetAllMocks', 'resetModules', 'restoreAllMocks', 'retryTimes', 'runAllImmediates', 'runAllTicks', 'runAllTimers', 'runOnlyPendingTimers', 'setMock', 'setSystemTime', 'setTimeout', 'spyOn', 'unmock', 'unstable_mockModule', 'useFakeTimers', 'useRealTimers'];

/**
 * @internal
 *
 * Creates an empty jest object with all unimplemented values. This allows
 * us to throw and detect areas where we probably need to extend. (Since we
 * are not comprehensive)
 */
function empty () {
  return KEYS.reduce((env, key) => ({
    ...env,
    key: unimplemented('jest', key)
  }), {});
}

/**
 * @internal
 *
 * This adds the mockRest and mockRestore functionality to any
 * spy or mock function
 **/
function extendMock (spy) {
  spy.mockReset = () => spy.mock.resetCalls();
  spy.mockRestore = () => spy.mock.restore();

  return spy;
}

/**
 * Sets up the jest object. This is certainly not extensive, and probably
 * not quite meant to be (never say never). Rather this adds the functionality
 * that we use in the polkadot-js projects.
 **/
function getJestKeys () {
  return {
    jest: {
      ...empty(),
      fn: (fn) => extendMock(mock.fn(fn)),
      restoreAllMocks: () => mock.reset(),
      spyOn: (obj, key) => extendMock(mock.method(obj, key))
    }
  };
}

module.exports = { getJestKeys };
