// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-var, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

// A very basic descriptor fro the actual global objects we expose in our Jest-like
// environment. Literally what is here is what it took us to convert all the tests
// in polkadot-js to node:test with a compatibility wrapper
//
// NOTE: What is here needs to align with the implementations in node/test/env

interface Describe {
  (name: string, fn: () => void, timeout?: number): void;

  // while each is specified in our environment, it is not in node:test, so
  // we also don't include it here to start weeding it out
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

type HookFn = () => unknown | Promise<unknown>;

interface It {
  (name: string, fn: HookFn, timeout?: number): void;

  // while each is specified in our environment, it is not in node:test, so
  // we also don't include it here to start weeding it out
  only: It;
  skip: It;
  todo: It;
}

interface Jest {
  fn: (fn?: (...args: any[]) => any) => Mock;
  restoreAllMocks: () => void;
  spyOn: (obj: object, key: string) => Mock;
}

type Lifecycle = (fn: HookFn) => void;

interface Matchers {
  not: Matchers;
  rejects: {
    toThrow: (message: string | RegExp) => Promise<void>;
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
  toThrow: (message: string | RegExp) => void;
}

interface Mock {
  (...args: any[]): any;

  mockReset: () => void;
  mockRestore: () => void;
}

declare global {
  var afterAll: Lifecycle;
  var afterEach: Lifecycle;
  var beforeAll: Lifecycle;
  var beforeEach: Lifecycle;
  var describe: Describe;
  var expect: Expect;
  var it: It;
  var jest: Jest;
}

export {};
