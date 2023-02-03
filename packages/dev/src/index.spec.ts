// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import test from 'ava';

import { adder, blah } from './test1';
import { echo } from '.';

test('runs the echo function', (t) => {
  blah();

  t.is(
    echo('something'),
    '1: 123: something'
  );
});

test('runs the adder function', (t) => {
  t.is(
    adder(1, 2),
    3
  );
});
