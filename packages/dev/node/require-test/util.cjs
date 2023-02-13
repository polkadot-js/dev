// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 *
 * @param {string} objName - The name of the top-level object
 * @param {string[]} keys - The keys that we are adding
 * @param {Record<string, (...args: unknown[]) => unknown>} obj
 * @returns {Record<string, (...args: unknown[]) => unknown>}
 */
function unimplemented (objName, keys, obj) {
  keys.forEach((key) => {
    if (!obj[key]) {
      obj[key] = () => {
        throw new Error(`${objName}.${key}(...) has not been implemented`);
      };
    }
  });

  return obj;
}

module.exports = { unimplemented };
