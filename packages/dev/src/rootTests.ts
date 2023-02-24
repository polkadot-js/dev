// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as testRoot from './root';

export function runTests ({ Clazz, TEST_PURE, bigIntExp, dynamic, json }: typeof testRoot): void {
  describe('Clazz', (): void => {
    it('has staticProperty', (): void => {
      expect(Clazz.staticProperty).toBe('foobar');
    });

    it('creates an instance with get/set', (): void => {
      const c = new Clazz(456);

      expect(c.something).toBe(123_456_789 & 456);

      c.setSomething(123);

      expect(c.something).toBe(123 & 456);
    });
  });

  describe('TEST_ROOT', (): void => {
    it('should have the correct value', (): void => {
      expect(TEST_PURE).toBe('testRoot');
    });
  });

  describe('json()', (): void => {
    it('should return the correct value', (): void => {
      expect(json()).toBe('works');
    });
  });

  describe('dynamic()', (): void => {
    it('should allow dynamic import usage', async (): Promise<void> => {
      expect(await dynamic(5, 37)).toBe(42);
    });
  });

  describe('bigIntExp()', (): void => {
    it('should return the correct value', (): void => {
      expect(bigIntExp()).toBe(123_456n * 137_858_491_849n);
    });
  });
}
