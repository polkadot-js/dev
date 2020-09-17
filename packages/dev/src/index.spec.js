// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as index from './index';

describe('index', () => {
  it('runs the test', () => {
    expect(index).toBeDefined();
  });

  it('runs the echo function', () => {
    expect(
      index.echo('something')
    ).toEqual('1: 123: something');
  });
});
