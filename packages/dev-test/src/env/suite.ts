// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, it } from 'node:test';

import { enhanceObj } from '../util.js';

interface WrapOpts {
  only?: boolean;
  skip?: boolean;
  todo?: boolean;
}

type WrapFn = (name: string, options: { only?: boolean; skip?: boolean; timeout?: number; todo?: boolean; }, fn: () => void | Promise<void>) => void;

const MINUTE = 60 * 1000;

/**
 * @internal
 *
 * Wraps either describe or it with relevant .only, .skip, .todo & .each helpers,
 * shimming it into a Jest-compatible environment.
 *
 * @param {} fn
 */
function createWrapper <T extends WrapFn> (fn: T, defaultTimeout: number) {
  const wrap = (opts: WrapOpts) => (name: string, exec: () => void | Promise<void>, timeout?: number) => fn(name, { ...opts, timeout: (timeout || defaultTimeout) }, exec);

  // Ensure that we have consistent helpers on the function. These are not consistently
  // applied accross all node:test versions, latest has all, so always apply ours.
  // Instead of node:test options for e.g. timeout, we provide a Jest-compatible signature
  return enhanceObj(wrap({}), {
    only: wrap({ only: true }),
    skip: wrap({ skip: true }),
    todo: wrap({ todo: true })
  });
}

/**
 * This ensures that the describe and it functions match our actual usages.
 * This includes .only, .skip and .todo helpers (.each is not applied)
 **/
export function suite () {
  return {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    describe: createWrapper(describe, 60 * MINUTE),
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    it: createWrapper(it, 2 * MINUTE)
  };
}
