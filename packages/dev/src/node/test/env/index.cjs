// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

const { browser } = require('./browser.cjs');
const { expect } = require('./expect.cjs');
const { jest } = require('./jest.cjs');
const { suite } = require('./suite.cjs');

/**
 * Exposes the jest-y environment via globals.
 *
 * @param {boolean} [isBrowser] - Set to true if we need to expose a bare-bone browser environment
 */
function exposeEnv (isBrowser) {
  [expect, jest, suite, isBrowser && browser].forEach((env) => {
    env && Object
      .entries(env())
      .forEach(([globalName, fn]) => {
        globalThis[globalName] ??= fn;
      });
  });
}

module.exports = { exposeEnv };
