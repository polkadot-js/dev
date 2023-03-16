// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseFn = (...args: any[]) => any;

type BaseObj = Record<string, unknown>;

/**
 * @internal
 *
 * Creates a replacer function which would extends a given object with the
 * named functions if they do not already exist on the object.
 */
function createStubObjFn <A extends Record<string, string>, N extends readonly string[]> (stubKeyFn: (objName: string, fnName: string, alts?: A) => BaseFn) {
  return (objName: string, fnNames: N, alts?: A) =>
    fnNames.reduce((obj, fnName) => {
      (obj as unknown as Record<string, BaseFn>)[fnName] ??= stubKeyFn(objName, fnName, alts);

      return obj;
    }, {} as { [K in N[number]]: BaseFn } & { [K in keyof A]: BaseFn });
}

/**
 * Extends an existing object with the additional function if they
 * are not already existing.
 */
export function enhanceObj <T extends BaseObj | BaseFn, E extends BaseObj> (obj: T, adds: E): T & E {
  Object
    .entries(adds)
    .forEach(([key, value]) => {
      (obj as Record<string, unknown>)[key] ??= value;
    });

  return obj as T & E;
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @type {StubObjFn}
 */
export const stubObj = /*#__PURE__*/ createStubObjFn((objName, fnName, alts) => () => {
  throw new Error(`${objName}.${fnName} has not been implemented${alts?.[fnName] ? ` (Use ${alts[fnName]} instead)` : ''}`);
});

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @type {StubObjFn}
 */
export const warnObj = /*#__PURE__*/ createStubObjFn((objName, fnName) => () => {
  console.warn(`${objName}.${fnName} has been implemented as a noop`);
});
