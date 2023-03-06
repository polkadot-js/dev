// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/// <reference types ="../node" />

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
});

describe('it', () => {
  it('has been enhanced', () => {
    expect(it.todo).toBeDefined();
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

  describe('.todo', () => {
    it.todo('marks as a todo when .todo is used', () => {
      expect(true).toBe(true);
    });
  });
});
