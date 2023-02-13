// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { enhance, unimplemented } from './util.cjs';

describe('enhance', (): void => {
  it('extends objects with non-existing values', (): void => {
    const test = enhance({ a: 0, b: () => 1 }, { c: () => 2 });

    expect(test.a).toBe(0);
    expect(test.b()).toBe(1);
    expect(test.c()).toBe(2);
  });

  it('doe not override existing values', (): void => {
    const test = enhance({ a: 0, b: () => 1 }, { b: () => 2 });

    expect(test.b()).toBe(1);
  });
});

describe('unimplemented', (): void => {
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
