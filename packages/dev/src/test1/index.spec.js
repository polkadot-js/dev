// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const index = require('./index').default;

describe('index', () => {
  it('runs the test', () => {
    expect(index).toBeDefined();
  });

  it('runs the echo function', () => {
    expect(
      index('something')
    ).toEqual('something');
  });
});
