// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { strict as assert } from 'node:assert';

import index, { blah } from '.';

describe('index', () => {
  it('has blah that is all ok', () => {
    assert.ok(blah);
  });

  it('runs the echo function', () => {
    assert.strictEqual(index('something'), 'something');
  });
});
