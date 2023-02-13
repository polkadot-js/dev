// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {(...args: unknown[]) => unknown} BaseFn
 * @typedef {Record<string, unknown>} BaseObj
 */

/**
 * Extends an existing object with the additional function if they
 * are not already existing.
 *
 * @param {BaseObj | BaseFn} obj
 * @param {BaseObj} add
 * @returns
 */
function enhance (obj, add) {
  Object
    .entries(add)
    .forEach(([key, value]) => {
      obj[key] ??= value;
    });

  return obj;
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @param {string} objName - The name of the top-level object
 * @param {string[]} keys - The keys that we are adding
 * @param {BaseObj | BaseFn} obj
 * @returns {Record<string, BaseFn>}
 */
function unimplemented (objName, keys, obj) {
  keys.forEach((key) => {
    obj[key] ??= () => {
      throw new Error(`${objName}.${key}(...) has not been implemented`);
    };
  });

  return obj;
}

module.exports = { enhance, unimplemented };
