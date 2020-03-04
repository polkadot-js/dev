// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import index from './';

describe('index', (): void => {
  it('runs the test', (): void => {
    expect(index).toBeDefined();
  });

  it('runs the echo function', (): void => {
    expect(
      index('something')
    ).toEqual('something');
  });
});
