// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { adder, blah } from './test1';
import { echo } from '.';

describe('index', () => {
  it('runs the echo function', () => {
    expect(blah()).not.toBeDefined();
    expect(echo('something')).toBe('1: 123: something');
  });

  it('runs the adder function', () => {
    expect(adder(1, 2)).toEqual(3);
  });

  it.skip('some skipped test', () => {
    // nothing to see here, move along
    expect(true).toBe(true);
  });
});
