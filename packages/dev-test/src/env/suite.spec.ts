// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

describe('describe()', () => {
  // eslint-disable-next-line jest/no-focused-tests
  describe.only('.only', () => {
    it('runs this one', () => {
      expect(true).toBe(true);
    });
  });

  // does not work as expected... (needs flags passed to execute)
  // describe('.only (none)', () => {
  //   it('skips alongside .only', () => {
  //     throw new Error('FATAL: This should not run');
  //   });
  // });

  describe('.skip', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    describe.skip('.only (.skip)', () => {
      it('skips inside .only', () => {
        expect(true).toBe(true);

        throw new Error('FATAL: This should not run');
      });
    });
  });
});

describe('it()', () => {
  it('has been enhanced', () => {
    expect(it.todo).toBeDefined();
  });

  describe('.only', () => {
    // does not work as expected
    // it('skips alongside .only', () => {
    //   throw new Error('FATAL: This should not run');
    // });

    // eslint-disable-next-line jest/no-focused-tests
    it.only('runs this test when .only is used', () => {
      expect(true).toBe(true);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('skips when .skip is used', () => {
      expect(true).toBe(true);

      throw new Error('FATAL: This should not run');
    });

    // Ummm... this doesn't match my expectation for actually passing...
    // it.todo('skips when .todo is used', () => {
    //   throw new Error('FATAL: This should not run');
    // });
  });

  describe('.skip', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('skips when .skip is used', () => {
      expect(true).toBe(true);

      throw new Error('FATAL: This should not run');
    });
  });

  describe('.todo', () => {
    it.todo('marks as a todo when .todo is used', () => {
      expect(true).toBe(true);
    });
  });
});
