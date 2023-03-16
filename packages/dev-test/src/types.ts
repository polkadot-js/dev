// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

export interface Describe {
  // NOTE In the node:test environment, fn is (ctx: SuiteContext) - we simplify our usages
  // (see the comment around it(..) later on that describes the rationale)
  (name: string, fn: () => void, timeout?: number): void;

  only: Describe;
  skip: Describe;
  todo: Describe;
}

export interface Expect {
  (value: unknown): Matchers;

  any: (clazz: Function) => object;
  anything: () => object;
  arrayContaining: (arr: unknown[]) => object;
  objectContaining: (check: object) => object;
  stringContaining: (check: string) => object;
  stringMatching: (check: string | RegExp) => object;
}

export interface It {
  // NOTE In some versions of node:test this is fn(done: () => void), however it is being
  // changed to be it(ctx: SuiteContext, done) - with this discrepancy it is better to
  // not have this since we would need to have differrening tests usages
  (name: string, fn: () => Promise<void> | void, timeout?: number): void;

  only: It;
  skip: It;
  todo: It;
}

export interface Jest {
  fn: (fn?: (...args: any[]) => any) => Mock;
  restoreAllMocks: () => void;
  spyOn: (obj: object, key: string) => Mock;
}

export type Lifecycle = (fn: () => Promise<void> | void) => void;

export interface Matchers {
  not: Matchers;
  rejects: {
    toThrow: (message?: string | RegExp) => Promise<void>;
  };

  toBe: (check: unknown) => void;
  toBeDefined: () => void;
  toBeFalsy: () => void;
  toBeInstanceOf: (clazz: Function) => void;
  toBeNull: () => void;
  toBeTruthy: () => void;
  toBeUndefined: () => void;
  toEqual: (check: unknown) => void;
  toHaveBeenCalled: () => void;
  toHaveBeenCalledTimes: (count: number) => void;
  toHaveBeenCalledWith: (...args: unknown[]) => void;
  toHaveBeenLastCalledWith: (...args: unknown[]) => void;
  toHaveLength: (length: number) => void;
  toMatch: (check: string | RegExp) => void;
  toMatchObject: (check: object) => void;
  toThrow: (message?: string | RegExp) => void;
}

export interface NodeMock {
  mockImplementation: (fn: (...args: unknown[]) => unknown) => unknown;
  mockImplementationOnce: (fn: (...args: unknown[]) => unknown) => unknown;
  resetCalls: () => void;
  restore: () => void;
}

export interface Mock {
  (...args: any[]): any;

  mockImplementation: (fn: (...args: unknown[]) => unknown) => void;
  mockImplementationOnce: (fn: (...args: unknown[]) => unknown) => void;
  mockReset: () => void;
  mockRestore: () => void;
}

export type MockFn = ((...args: unknown[]) => unknown) & { mock: NodeMock };

export type Spy = MockFn & Mock;
