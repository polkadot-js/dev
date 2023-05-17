// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference types="@polkadot/dev-test/globals.d.ts" />

import { enhanceObj, stubObj, warnObj } from './util.js';

describe('enhanceObj', () => {
  it('extends objects with non-existing values', () => {
    const test = enhanceObj(
      enhanceObj(
        { a: () => 1 },
        { b: () => 2 }
      ),
      { c: () => 3 }
    );

    expect(test.a()).toBe(1);
    expect(test.b()).toBe(2);
    expect(test.c()).toBe(3);
  });

  it('does not override existing values', () => {
    const test = enhanceObj(
      enhanceObj(
        { a: 0, b: () => 1 },
        { a: () => 0, b: () => 2 }
      ),
      { c: () => 2 }
    );

    expect(test.a).toBe(0);
    expect(test.b()).toBe(1);
    expect(test.c()).toBe(2);
  });
});

describe('stubObj', () => {
  it('has entries throwing for unimplemented values', () => {
    const test = stubObj('obj', ['a', 'b'] as const);

    expect(
      () => test.b()
    ).toThrow('obj.b has not been implemented');
  });

  it('has entries throwing for unimplemented values (w/ alternatives)', () => {
    const test = stubObj('obj', ['a', 'b'] as const, { b: 'obj.a' });

    expect(
      () => test.b()
    ).toThrow('obj.b has not been implemented (Use obj.a instead)');
  });
});

describe('warnObj', () => {
  let spy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    spy = jest.spyOn(console, 'warn');
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('has entries warning on unimplemented', () => {
    const test = warnObj('obj', ['a', 'b'] as const);

    test.b();

    expect(spy).toHaveBeenCalledWith('obj.b has been implemented as a noop');
  });
});
