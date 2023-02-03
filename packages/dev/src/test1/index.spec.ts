// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert';
import { describe, it } from 'node:test';

import index, { blah } from '.';

describe('index', () => {
  it('runs the test', () => {
    assert.ok(blah);
  });

  it('runs the echo function', () => {
    assert.strictEqual(
      index('something'),
      'something'
    );
  });
});
