// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { after: afterAll, afterEach, before: beforeAll, beforeEach, describe, it } = require('node:test');

/** @internal adjust describe/it to make it jest-like */
function getSuiteKeys () {
  return Object
    .entries({ describe, it })
    .reduce((env, [key, fn]) => {
      const wrap = (opts) => (text, exec) => fn(text, opts, exec);
      const each = (opts) => (arr) => (text, exec) => arr.forEach((v, i) => fn(text?.replace('%s', v.toString()).replace('%i', i.toString()).replace('%p', JSON.stringify(v)), opts, exec?.(v, i)));
      const globalFn = wrap({});

      // unlike only/skip/todo these are a jest-only extension
      globalFn.each = each({});

      // These are the real reason we have this wrapping - however they
      // _are_ being added to the test:node core, so can be removed soon-ish
      // (Support is very spotty on at least node 18)
      //
      // See https://github.com/nodejs/node/pull/46604
      ['only', 'skip', 'todo'].forEach((opt) => {
        globalFn[opt] = wrap({ [opt]: true });
        globalFn.each[opt] = each({ [opt]: true });
      });

      return {
        ...env,
        [key]: globalFn
      };
    }, { afterAll, afterEach, beforeAll, beforeEach });
}

module.exports = { getSuiteKeys };
