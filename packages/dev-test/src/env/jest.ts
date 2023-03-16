// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Mock, MockFn, Spy } from '../types.js';

import { mock } from 'node:test';

import { enhanceObj, stubObj, warnObj } from '../util.js';

// logged via Object.keys(jest).sort()
const JEST_KEYS_STUB = ['advanceTimersByTime', 'advanceTimersToNextTimer', 'autoMockOff', 'autoMockOn', 'clearAllMocks', 'clearAllTimers', 'createMockFromModule', 'deepUnmock', 'disableAutomock', 'doMock', 'dontMock', 'enableAutomock', 'fn', 'genMockFromModule', 'getRealSystemTime', 'getSeed', 'getTimerCount', 'isEnvironmentTornDown', 'isMockFunction', 'isolateModules', 'isolateModulesAsync', 'mock', 'mocked', 'now', 'replaceProperty', 'requireActual', 'requireMock', 'resetAllMocks', 'resetModules', 'restoreAllMocks', 'retryTimes', 'runAllImmediates', 'runAllTicks', 'runAllTimers', 'runOnlyPendingTimers', 'setMock', 'setSystemTime', 'setTimeout', 'spyOn', 'unmock', 'unstable_mockModule', 'useFakeTimers', 'useRealTimers'] as const;

const JEST_KEYS_WARN = ['setTimeout'] as const;

// logged via Object.keys(jest.fn()).sort()
const MOCK_KEYS_STUB = ['_isMockFunction', 'getMockImplementation', 'getMockName', 'mock', 'mockClear', 'mockImplementation', 'mockImplementationOnce', 'mockName', 'mockRejectedValue', 'mockRejectedValueOnce', 'mockReset', 'mockResolvedValue', 'mockResolvedValueOnce', 'mockRestore', 'mockReturnThis', 'mockReturnValue', 'mockReturnValueOnce', 'withImplementation'] as const;

const jestStub = stubObj('jest', JEST_KEYS_STUB);
const jestWarn = warnObj('jest', JEST_KEYS_WARN);
const mockStub = stubObj('jest.fn()', MOCK_KEYS_STUB);

/**
 * @internal
 *
 * This adds the mockReset and mockRestore functionality to any
 * spy or mock function
 **/
function extendMock (spy: MockFn): Spy & Mock {
  const withMock = enhanceObj(spy, {
    mockImplementation: (fn: (...args: unknown[]) => unknown) => spy.mock.mockImplementation(fn),
    mockImplementationOnce: (fn: (...args: unknown[]) => unknown) => spy.mock.mockImplementationOnce(fn),
    mockReset: () => spy.mock.resetCalls(),
    mockRestore: () => spy.mock.restore()
  });
  const withStub = enhanceObj(withMock, mockStub);

  return withStub;
}

/**
 * Sets up the jest object. This is certainly not extensive, and probably
 * not quite meant to be (never say never). Rather this adds the functionality
 * that we use in the polkadot-js projects.
 **/
export function jest () {
  const withBase = {
    fn: (fn: (...args: unknown[]) => unknown) => extendMock(mock.fn(fn)),
    restoreAllMocks: () => mock.reset(),
    spyOn: (obj: object, key: never) => extendMock(mock.method(obj, key))
  };
  const withWarn = enhanceObj(withBase, jestWarn);
  const withStub = enhanceObj(withWarn, jestStub);

  return {
    jest: withStub
  };
}
