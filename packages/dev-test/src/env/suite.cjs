// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

const { after, afterEach, before, beforeEach, describe, it } = require('node:test');

const { enhanceObj } = require('../util.cjs');

/**
 * @typedef {{ only?: boolean, skip?: boolean, todo?: boolean }} WrapOpts
 */

/**
 * @internal
 *
 * Wraps either decribe or it with relevant .only, .skip, .todo & .each helpers,
 * shimming it into a Jest-compatible environment.
 *
 * @param {typeof describe | typeof it} fn
 */
function createWrapper (fn) {
  /** @type {(opts: WrapOpts) => (name: string, exec?: (done?: () => void) => unknown, timeout?: number) => void} */
  const wrap = (opts) => (name, exec, timeout) => fn(name, timeout ? { ...opts, timeout } : opts, exec);

  // Ensure that we have consistent helpers on the function
  // (if not already applied)
  return enhanceObj(wrap({}), {
    only: wrap({ only: true }),
    skip: wrap({ skip: true }),
    todo: wrap({ todo: true })
  });
}

/**
 * This ensures that the describe and it functions match our actual usages.
 * This includes .only, .skip, .todo as well as .ech helpers
 **/
function suite () {
  return {
    after,
    afterAll: after,
    afterEach,
    before,
    beforeAll: before,
    beforeEach,
    describe: createWrapper(describe),
    it: createWrapper(it)
  };
}

module.exports = { suite };
