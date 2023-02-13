// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * A simple helper to indicate unimplemented functionality
 */
function unimplemented (name, key) {
  return () => {
    throw new Error(`${name}.${key}(...) has not been implemented`);
  };
}

module.exports = { unimplemented };
