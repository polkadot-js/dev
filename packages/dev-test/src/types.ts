// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;

export type BaseObj = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type BaseFn = Function;

export type StubFn = (...args: unknown[]) => unknown;

// These basically needs to align with the ReturnType<typeof node:test:mock['fn']>
// functions at least for the functionality that we are using: accessing calls &
// managing the mock interface with resets and restores
export type WithMock<F extends AnyFn> = F & {
  mock: {
    calls: {
      arguments: unknown[];
    }[];

    mockImplementation: (fn: AnyFn) => void;
    mockImplementationOnce: (fn: AnyFn) => void;
    resetCalls: () => void;
    restore: () => void;
  }
}
