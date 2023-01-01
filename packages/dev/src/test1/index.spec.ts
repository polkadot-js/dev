// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import index, { blah } from '.';

describe('index', () => {
  it('runs the test', () => {
    expect(blah).toBeDefined();
  });

  it('runs the echo function', () => {
    expect(
      index('something')
    ).toEqual('something');
  });
});
