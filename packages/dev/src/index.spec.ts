// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { strict as assert } from 'node:assert';

import { adder, blah } from './test1';
import { echo } from '.';

describe('index', () => {
  it('runs the echo function', () => {
    assert.equal(blah(), undefined);
    assert.strictEqual(echo('something'), '1: 123: something');
  });

  it('runs the adder function', () => {
    assert.strictEqual(adder(1, 2), 3);
  });

  it.skip('some skipped test', () => {
    // nothing to see here, move along
    assert.ok(true);
  });
});
