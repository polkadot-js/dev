// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {(...args: unknown[]) => unknown} BaseFn
 * @typedef {Record<string, unknown>} BaseObj
 * @typedef {Record<string, BaseFn>} EnhancedObj
 */

/**
 * Extends an existing object with the additional function if they
 * are not already existing.
 *
 * @param {BaseObj | BaseFn} obj
 * @param {BaseObj[]} adds
 * @returns {EnhancedObj}
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
 * Creates a stub function that will throw with the name when
 * called. This is used to indicate future work, defined functions
 * with no defined implementation.
 *
 * @param {string} objName - The name of the top-level object
 * @param {string} fnName - The name of this function
 * @param {Record<string, string>} [alts] - Alternatives, if existing
 * @returns {(...args: unknown[]) => never}
 */
function stubFn (objName, fnName, alts = {}) {
  return () => {
    throw new Error(`${objName}.${fnName} has not been implemented${alts[fnName] ? ` (Use ${alts[fnName]} instead)` : ''}`);
  };
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @param {string} objName - The name of the top-level object
 * @param {string[]} keys - The stub key names we are adding
 * @param {Record<string, string>} [alts] - Alternatives, if existing
 * @returns {EnhancedObj}
 */
function stubObj (objName, keys, alts) {
  const obj = {};

  keys.forEach((fnName) => {
    obj[fnName] ??= stubFn(objName, fnName, alts);
  });

  return obj;
}

/**
 * Warns on the usage of a certain function while performing a noop.
 * This is much like stubFn, however it does not fail the operation.
 *
 * @param {string} objName - The name of the top-level object
 * @param {string} fnName - The name of this function
 * @returns {(...args: unknown[]) => void}
 */
function warnFn (objName, fnName) {
  return () => {
    console.warn(`${objName}.${fnName} has been implemented as a noop`);
  };
}

module.exports = { enhanceObj, stubFn, stubObj, warnFn };
