// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { unimplemented } from './util.cjs';

describe('unimplementedObj', (): void => {
  it('throws on unimplemented values', (): void => {
    const test = unimplemented('obj', ['a', 'b'], {
      a: () => 'test'
    });

    expect(
      () => test.b()
    ).toThrow('obj.b(...) has not been implemented');
  });

  it('calls into implemented values', (): void => {
    const test = unimplemented('obj', ['a', 'b'], {
      b: () => 'test'
    });

    const spy = jest.spyOn(test, 'b');

    test.b(1, 2, 3);

    expect(spy).toHaveBeenLastCalledWith(1, 2, 3);
  });
});
