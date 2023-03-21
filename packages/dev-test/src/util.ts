// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseFn, BaseObj, StubFn } from './types.js';

/**
 * Extends an existing object with the additional function if they
 * are not already existing.
 */
export function enhanceObj <T extends BaseObj | BaseFn, X> (obj: T, extra: X) {
  Object
    .entries(extra as Record<string, unknown>)
    .forEach(([key, value]) => {
      (obj as Record<string, unknown>)[key] ??= value;
    });

  return obj as T & Omit<X, keyof T>;
}

/**
 * @internal
 *
 * A helper to create a stub object based wite the stub creator supplied
 */
function createStub <N extends readonly string[]> (keys: N, creator: (key: string) => StubFn) {
  return keys.reduce<Record<string, StubFn>>((obj, key) => {
    obj[key] ??= creator(key);

    return obj;
  }, {}) as unknown as { [K in N[number]]: StubFn };
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @type {StubObjFn}
 */
export function stubObj <N extends readonly string[]> (objName: string, keys: N, alts?: Record<string, string>) {
  return createStub(keys, (key) => () => {
    const alt = alts?.[key];

    throw new Error(`${objName}.${key} has not been implemented${alt ? ` (Use ${alt} instead)` : ''}`);
  });
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @type {StubObjFn}
 */
export function warnObj <N extends readonly string[]> (objName: string, keys: N) {
  return createStub(keys, (key) => () => {
    console.warn(`${objName}.${key} has been implemented as a noop`);
  });
}
