// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-var, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

// A very basic descriptor for the actual global objects we expose in our Jest-like
// environment. Literally what is here is what it took us to convert all the tests
// in polkadot-js to node:test with a compatibility wrapper
//
// NOTE: What is here needs to align with the implementations in node/test/env

interface Describe {
  // NOTE In the node:test environment, fn is (ctx: SuiteContext) - we simplify our usages
  // (see the comment around it(..) later on that describes the rationale)
  (name: string, fn: () => void, timeout?: number): void;

  only: Describe;
  skip: Describe;
  todo: Describe;
}

interface Expect {
  (value: unknown): Matchers;

  // eslint-disable-next-line @typescript-eslint/ban-types
  any: (clazz: Function) => object;
  anything: () => object;
  arrayContaining: (arr: unknown[]) => object;
  objectContaining: (check: object) => object;
  stringContaining: (check: string) => object;
  stringMatching: (check: string | RegExp) => object;
}

interface It {
  // NOTE In some versions of node:test this is fn(done: () => void), however it is being
  // changed to be it(ctx: SuiteContext, done) - with this discrepancy it is better to
  // not have this since we would need to have differrening tests usages
  (name: string, fn: () => Promise<void> | void, timeout?: number): void;

  only: It;
  skip: It;
  todo: It;
}

interface Jest {
  fn: (fn?: (...args: any[]) => any) => Mock;
  restoreAllMocks: () => void;
  spyOn: (obj: object, key: string) => Mock;
}

type Lifecycle = (fn: () => Promise<void> | void) => void;

interface Matchers {
  not: Matchers;
  rejects: {
    toThrow: (message?: string | RegExp) => Promise<void>;
  };

  toBe: (check: unknown) => void;
  toBeDefined: () => void;
  toBeFalsy: () => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
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

interface Mock {
  (...args: any[]): any;

  mockImplementation: (fn: (...args: unknown[]) => unknown) => void;
  mockImplementationOnce: (fn: (...args: unknown[]) => unknown) => void;
  mockReset: () => void;
  mockRestore: () => void;
}

declare global {
  var after: Lifecycle;
  /** Jest-compatible alias for before */
  var afterAll: Lifecycle;
  var afterEach: Lifecycle;
  var before: Lifecycle;
  /** Jest-compatible alias for after */
  var beforeAll: Lifecycle;
  var beforeEach: Lifecycle;
  var describe: Describe;
  var expect: Expect;
  var it: It;
  var jest: Jest;
}

export {};
