// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AnyFn, WithMock } from '../types.js';

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
function extendMock <F extends AnyFn> (mocked: WithMock<F>) {
  // We use the node:test mock here for casting below - however we
  // don't want this in any method signature since this is a private
  // types export, which could get us in "some" trouble
  //
  // Effectively the casts below ensure that our WithMock<*> aligns
  // on a high-level to what we use via private type...
  const spy = (mocked as unknown as ReturnType<typeof mock['fn']>);

  return enhanceObj(enhanceObj(mocked, {
    mockImplementation: <F extends AnyFn> (fn: F): void => {
      spy.mock.mockImplementation(fn);
    },
    mockImplementationOnce: <F extends AnyFn> (fn: F): void => {
      spy.mock.mockImplementationOnce(fn);
    },
    mockReset: (): void => {
      spy.mock.resetCalls();
    },
    mockRestore: (): void => {
      spy.mock.restore();
    }
  }), mockStub);
}

/**
 * Sets up the jest object. This is certainly not extensive, and probably
 * not quite meant to be (never say never). Rather this adds the functionality
 * that we use in the polkadot-js projects.
 **/
export function jest () {
  return {
    jest: enhanceObj(enhanceObj({
      fn: <F extends AnyFn> (fn?: F) => extendMock<F>(mock.fn(fn)),
      restoreAllMocks: () => {
        mock.reset();
      },
      spyOn: <F extends AnyFn> (obj: object, key: string) => extendMock<F>(mock.method(obj, key as keyof typeof obj))
    }, jestWarn), jestStub)
  };
}
