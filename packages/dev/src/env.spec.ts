// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert';

describe('testing environment', (): void => {
  it('works with node:assert', (): void => {
    assert.ok(true);
  });

  describe('expect', (): void => {
    describe('.toThrow', (): void => {
      const thrower = () => {
        throw new Error('some error');
      };

      it('matches error with empty throw', (): void => {
        expect(thrower).toThrow();
      });

      it('matches error with exact message', (): void => {
        expect(thrower).toThrow('some error');
      });

      it('matches error with regex message', (): void => {
        expect(thrower).toThrow(/me er/);
      });

      it('handles .not correctly (no throw, empty message)', (): void => {
        expect(() => undefined).not.toThrow();
      });

      it('handles .not correctly (no throw, regex match)', (): void => {
        expect(() => undefined).not.toThrow(/me er/);
      });

      it('handles .not correctly (throw, string match)', (): void => {
        expect(() => undefined).not.toThrow('no match');
      });

      it('handles .not correctly (throw, regex match)', (): void => {
        expect(() => undefined).not.toThrow(/no match/);
      });
    });
  });

  describe('describe', (): void => {
    describe.only('.only', (): void => {
      it('runs this one', (): void => {
        expect(true).toBe(true);
      });
    });

    // does not work as expected...
    // describe('.only (none)', (): void => {
    //   it('skips alongside .only', (): void => {
    //     throw new Error('FATAL: This should not run');
    //   });
    // });

    describe.skip('.only (.skip)', (): void => {
      it('skips inside .only', (): void => {
        throw new Error('FATAL: This should not run');
      });
    });
  });

  describe('it', (): void => {
    describe('.each', (): void => {
      it.each(['first', 'second', 'third'])('p formatter :: %p', (v): void => {
        expect(v).toBeDefined();
      });
    });

    describe('.only', (): void => {
      // does not work as expected
      // it('skips alongside .only', (): void => {
      //   throw new Error('FATAL: This should not run');
      // });

      it.only('runs this test when .only is used', (): void => {
        expect(true).toBe(true);
      });

      it.skip('skips when .skip is used', (): void => {
        throw new Error('FATAL: This should not run');
      });

      // Ummm... this doesn't match my expectation for actually passing...
      // it.todo('skips when .todo is used', (): void => {
      //   throw new Error('FATAL: This should not run');
      // });
    });

    describe('.skip', (): void => {
      it.skip('skips when .skip is used', (): void => {
        throw new Error('FATAL: This should not run');
      });
    });
  });
});
