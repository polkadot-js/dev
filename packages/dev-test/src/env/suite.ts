// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { after, afterEach, before, beforeEach, describe, it } from 'node:test';

import { enhanceObj } from '../util.js';

interface WrapOpts {
  only?: boolean;
  skip?: boolean;
  todo?: boolean;
}

/**
 * @internal
 *
 * Wraps either decribe or it with relevant .only, .skip, .todo & .each helpers,
 * shimming it into a Jest-compatible environment.
 *
 * @param {} fn
 */
function createWrapper <T extends typeof describe | typeof it> (fn: T) {
  const wrap = (opts: WrapOpts) => (name: string, exec: () => unknown, timeout?: number) => fn(name, timeout ? { ...opts, timeout } : opts, exec);

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
export function suite () {
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
