// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

describe('describe', () => {
  describe.only('.only', () => {
    it('runs this one', () => {
      expect(true).toBe(true);
    });
  });

  // does not work as expected...
  // describe('.only (none)', () => {
  //   it('skips alongside .only', () => {
  //     throw new Error('FATAL: This should not run');
  //   });
  // });

  describe('.skip', () => {
    describe.skip('.only (.skip)', () => {
      it('skips inside .only', () => {
        throw new Error('FATAL: This should not run');
      });
    });
  });

  describe('.each', () => {
    describe.each([['foo', 'bar', 1]])('each passes through variables %i', (foo, bar, num, i) => {
      expect(foo).toEqual('foo');
      expect(bar).toEqual('bar');
      expect(num).toEqual(1);
      expect(i).toEqual(0);
    });
  });
});

describe('it', () => {
  it('has been enhanced', () => {
    expect(it.each).toBeDefined();
  });

  describe('.each', () => {
    it.each(['first', 'second', 'third'])('p formatter :: %p', (v) => {
      expect(v).toBeDefined();
    });
  });

  describe('.only', () => {
    // does not work as expected
    // it('skips alongside .only', () => {
    //   throw new Error('FATAL: This should not run');
    // });

    it.only('runs this test when .only is used', () => {
      expect(true).toBe(true);
    });

    it.skip('skips when .skip is used', () => {
      throw new Error('FATAL: This should not run');
    });

    // Ummm... this doesn't match my expectation for actually passing...
    // it.todo('skips when .todo is used', () => {
    //   throw new Error('FATAL: This should not run');
    // });
  });

  describe('.skip', () => {
    it.skip('skips when .skip is used', () => {
      throw new Error('FATAL: This should not run');
    });
  });
});
