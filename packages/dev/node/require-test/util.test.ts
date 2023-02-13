// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { unimplemented, unimplementedObj } from './util.cjs';

describe('unimplemented', (): void => {
  it('throws on unimplemented usage', (): void => {
    const test = unimplemented('obj', 'method');

    expect(
      () => test('blah')
    ).toThrow('obj.method(...) has not been implemented');
  });
});

describe('unimplementedObj', (): void => {
  it('throws on unimplemented values', (): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const test = unimplementedObj('obj', ['a', 'b'], {
      a: () => 'test'
    });

    expect(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      () => test.b()
    ).toThrow('obj.b(...) has not been implemented');
  });

  it('calls into implemented values', (): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const test = unimplementedObj('obj', ['a', 'b'], {
      b: () => 'test'
    });

    const spy = jest.spyOn(test, 'b');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    test.b(1, 2, 3);

    expect(spy).toHaveBeenLastCalledWith(1, 2, 3);
  });
});
