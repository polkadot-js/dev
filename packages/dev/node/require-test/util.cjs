// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * A simple helper to indicate unimplemented functionality
 *
 * @param {string} objName - The name of the top-level object
 * @param {string} key - The key that we are extending
 * @returns {(...args: unknown[]) => never}
 */
function unimplemented (objName, key) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (..._) => {
    throw new Error(`${objName}.${key}(...) has not been implemented`);
  };
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @param {string} objName - The name of the top-level object
 * @param {string[]} keys - The keys that we are adding
 * @param {Record<string, (...args: unknown[]) => unknown>} obj
 * @returns {Record<string, (...args: unknown[]) => unknown>}
 */
function unimplementedObj (objName, keys, obj) {
  keys.forEach((key) => {
    if (!obj[key]) {
      obj[key] = unimplemented(objName, key);
    }
  });

  return obj;
}

module.exports = { unimplemented, unimplementedObj };
