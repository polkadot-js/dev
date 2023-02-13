// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * A simple helper to indicate unimplemented functionality
 */
function unimplemented (name, key) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (..._) => {
    throw new Error(`${name}.${key}(...) has not been implemented`);
  };
}

/**
 * Extends a given object with the named functions if they do not
 * already exist on the object.
 */
function unimplementedObj (name, keys, obj) {
  keys.forEach((key) => {
    if (!obj[key]) {
      obj[key] = unimplemented(name, key);
    }
  });

  return obj;
}

module.exports = { unimplemented, unimplementedObj };
