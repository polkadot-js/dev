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
});
