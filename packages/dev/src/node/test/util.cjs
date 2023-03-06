// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/** @typedef {(...args: any[]) => any} BaseFn */
/** @typedef {Record<string, any>} BaseObj */
/** @typedef {Record<string, BaseFn>} EnhancedObj */
/** @typedef {(objName: string, fnName: string, alts?: Record<string, string>) => BaseFn} StubKeyFn */
/** @typedef {(objName: string, fnNames: string[], alts?: Record<string, string>) => EnhancedObj} StubObjFn */

/**
 * @internal
 *
 * Creates a replacer function which would extends a given object with the
 * named functions if they do not already exist on the object.
 *
 * @param {StubKeyFn} stubKeyFn
 * @returns {StubObjFn}
 */
function createStubObjFn (stubKeyFn) {
  return (objName, fnNames, alts) =>
    fnNames.reduce((obj, fnName) => {
      obj[fnName] ??= stubKeyFn(objName, fnName, alts);

      return obj;
    }, {});
}

/**
 * Extends an existing object with the additional function if they
 * are not already existing.
 *
 * @param {BaseObj | BaseFn} obj
 * @param {BaseObj[]} adds
 * @returns {any}
 */
function enhanceObj (obj, ...adds) {
  adds.forEach((add) =>
    Object
      .entries(add)
      .forEach(([key, value]) => {
        obj[key] ??= value;
      })
  );

  return obj;
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @type {StubObjFn}
 */
const stubObj = createStubObjFn((objName, fnName, alts) => () => {
  throw new Error(`${objName}.${fnName} has not been implemented${alts?.[fnName] ? ` (Use ${alts[fnName]} instead)` : ''}`);
});

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @type {StubObjFn}
 */
const warnObj = createStubObjFn((objName, fnName) => () => {
  console.warn(`${objName}.${fnName} has been implemented as a noop`);
});

module.exports = { enhanceObj, stubObj, warnObj };
