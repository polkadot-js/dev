// Copyright 2017-2018 @polkadot/dev authors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

const index = require('./');

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
