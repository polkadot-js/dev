// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { echo } from '.';

describe('index', () => {
  it('runs the echo function', () => {
    expect(
      echo('something')
    ).toEqual('1: 123: something');
  });
});
