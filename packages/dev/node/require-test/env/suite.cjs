// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { after: afterAll, afterEach, before: beforeAll, beforeEach, describe, it } = require('node:test');

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
  /** @type {(opts: WrapOpts) => (name: string, exec?: () => unknown, timeout?: number) => void} */
  const wrap = (opts = {}) => (name, exec, timeout) => fn(name, timeout ? { ...opts, timeout } : opts, exec);

  /** @type {(opts: WrapOpts) => (arr: unknown[]) => (name: string, exec?: (...v: unknown[]) => unknown, timeout?: number) => void} */
  const each = (opts = {}) => (arr) => (name, exec, timeout) => arr.forEach((v, i) => fn(name?.replace('%s', v?.toString()).replace('%i', i.toString()).replace('%p', JSON.stringify(v)), timeout ? { ...opts, timeout } : opts, () => Array.isArray(v) ? exec?.(...v, i) : exec?.(v, i)));

  // Ensure that we have consistent helpers on the function
  // (if not already applied)
  return enhanceObj(wrap(), {
    each: enhanceObj(each(), {
      only: each({ only: true }),
      skip: each({ skip: true }),
      todo: each({ todo: true })
    }),
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
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe: createWrapper(describe),
    it: createWrapper(it)
  };
}

module.exports = { suite };
