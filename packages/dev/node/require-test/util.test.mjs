// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { enhanceObj, stubObj } from './util.cjs';

describe('enhanceObj', () => {
  it('extends objects with non-existing values', () => {
    const test = enhanceObj(
      { a: () => 1 },
      { b: () => 2 },
      { c: () => 3 }
    );

    expect(test.a()).toBe(1);
    expect(test.b()).toBe(2);
    expect(test.c()).toBe(3);
  });

  it('does not override existing values', () => {
    const test = enhanceObj(
      { a: 0, b: () => 1 },
      { a: () => 0, b: () => 2 },
      { c: () => 2 }
    );

    expect(test.a).toBe(0);
    expect(test.b()).toBe(1);
    expect(test.c()).toBe(2);
  });
});

describe('stubObj', () => {
  it('has entries throwing for unimplemented values', () => {
    const test = stubObj('obj', ['a', 'b']);

    expect(
      () => test.b()
    ).toThrow('obj.b has not been implemented');
  });

  it('has entries throwing for unimplemented values (w/ alternatives)', () => {
    const test = stubObj('obj', ['a', 'b'], { b: 'obj.a' });

    expect(
      () => test.b()
    ).toThrow('obj.b has not been implemented (Use obj.a instead)');
  });
});
