// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-types */

type StubFn = (...args: unknown[]) => unknown;

type BaseObj = Record<string, unknown>;

/**
 * Extends an existing object with the additional function if they
 * are not already existing.
 */
export function enhanceObj <T extends BaseObj | Function, E, K extends keyof T> (obj: T, adds: E): T & Omit<E, K> {
  Object
    .entries(adds as Record<string, unknown>)
    .forEach(([key, value]) => {
      (obj as Record<string, unknown>)[key] ??= value;
    });

  return obj as T & Omit<E, K>;
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @type {StubObjFn}
 */
export function stubObj <N extends readonly string[], A> (objName: string, fnNames: N, alts?: A) {
  return fnNames.reduce((obj, fnName) => {
    (obj as unknown as Record<string, StubFn>)[fnName] ??= () => {
      throw new Error(`${objName}.${fnName} has not been implemented${(alts as Record<string, string>)?.[fnName] ? ` (Use ${(alts as Record<string, string>)[fnName]} instead)` : ''}`);
    };

    return obj;
  }, {} as { [K1 in N[number]]: StubFn });
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @type {StubObjFn}
 */
export function warnObj <N extends readonly string[]> (objName: string, fnNames: N) {
  return fnNames.reduce((obj, fnName) => {
    (obj as unknown as Record<string, StubFn>)[fnName] ??= () => {
      console.warn(`${objName}.${fnName} has been implemented as a noop`);
    };

    return obj;
  }, {} as { [K1 in N[number]]: StubFn });
}
