// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import test from 'ava';

import index, { blah } from '.';

test('runs the test', (t) => {
  t.truthy(blah);
});

test('runs the echo function', (t) => {
  t.is(
    index('something'),
    'something'
  );
});
