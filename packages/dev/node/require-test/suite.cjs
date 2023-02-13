// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { after: afterAll, afterEach, before: beforeAll, beforeEach, describe, it } = require('node:test');

/**
 * @internal
 *
 * Wraps either decribe or it with relevant .only, .skip, .todo & .each helpers,
 * shimming it into a Jest-compatible environment.
 */
function createWrapper (fn) {
  const wrap = (opts) => (text, exec) => fn(text, opts, exec);
  const each = (opts) => (arr) => (text, exec) => arr.forEach((v, i) => fn(text?.replace('%s', v.toString()).replace('%i', i.toString()).replace('%p', JSON.stringify(v)), opts, exec?.(v, i)));

  // create the top-level exported wrapper (we don't clobber the input function)
  const wrapped = wrap({});

  // unlike only/skip/todo these are a jest-only extension and actually
  // used quite a few times in polkadot-js tests, hence the support here
  wrapped.each = each({});

  // These are the initial reason we have this wrapping - however they
  // _are_ being added to the test:node core, so can be removed soon-ish
  // (Support is very spotty on at least node 18, hence adding them)
  //
  // See https://github.com/nodejs/node/pull/46604
  ['only', 'skip', 'todo'].forEach((key) => {
    const opts = { [key]: true };

    wrapped[key] = wrap(opts);
    wrapped.each[key] = each(opts);
  });

  return wrapped;
}

/**
 * This ensures that the describe and it functions match our actual usages.
 * This includes .only, .skip, .todo as well as .ech helpers
 **/
function getSuiteKeys () {
  return {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe: createWrapper(describe),
    it: createWrapper(it)
  };
}

module.exports = { getSuiteKeys };
