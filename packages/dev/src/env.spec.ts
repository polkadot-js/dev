// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert';

assert.ok(true);

describe('expect', (): void => {
  it('has been decorated', (): void => {
    expect(expect.not).toBeDefined();
  });

  it('throws on unimplemented', (): void => {
    expect(
      () => expect(true).not.toReturnWith()
    ).toThrow('expect(...).not.toReturnWith has not been implemented');
  });

  it('throws on unimplemented (with alternative)', (): void => {
    expect(
      () => expect(true).not.toBeFalsy()
    ).toThrow('expect(...).not.toBeFalsy has not been implemented (Use expect(...).toBeTruthy instead)');
  });

  describe('.toBeDefined', (): void => {
    it('does not throw on null', (): void => {
      expect(null).toBeDefined();
    });

    it('throws on undefined', (): void => {
      expect(
        () => expect(undefined).toBeDefined()
      ).toThrow();
    });

    it('.not does not throw on undefined', (): void => {
      expect(undefined).not.toBeDefined();
    });
  });

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

  describe('.toMatch', (): void => {
    it('fails matching when non-object passed in', (): void => {
      expect(
        () => expect(undefined).toMatch(/match/)
      ).toThrow(/Expected string/);
    });

    it('fails matching when non-matching string passed in', (): void => {
      expect(
        () => expect('some').toMatch(/match/)
      ).toThrow(/did not match/);
    });

    it('matches string passed', (): void => {
      expect(
        () => expect('matching').toMatch(/match/)
      ).not.toThrow();
    });
  });

  describe('.toMatchObject', (): void => {
    it('fails matching when non-object passed in', (): void => {
      expect(
        () => expect(undefined).toMatchObject({ foo: 'bar' })
      ).toThrow(/Expected object/);
    });

    it('matches empty object', (): void => {
      expect({
        a: 'foo',
        b: 'bar'
      }).toMatchObject({});
    });

    it('matches object with some fields', (): void => {
      expect({
        a: 'foo',
        b: 'bar',
        c: 123
      }).toMatchObject({
        a: 'foo',
        c: 123
      });
    });

    it('matches an object with some matcher supplied', (): void => {
      expect({
        a: 'foo bar',
        b: 'baz',
        c: 'zaz'
      }).toMatchObject({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        a: expect.stringMatching(/o b/),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        b: expect.stringMatching('baz'),
        c: 'zaz'
      });
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
  it('has been enhanced', (): void => {
    expect(it.each).toBeDefined();
  });

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

describe('jest', (): void => {
  it('has been enhanced', (): void => {
    expect(jest.setTimeout).toBeDefined();
  });

  describe('.fn', (): void => {
    it('works on .toHaveBeenCalled', (): void => {
      const mock = jest.fn(() => 3);

      expect(mock).not.toHaveBeenCalled();
      expect(mock()).toBe(3);
      expect(mock).toHaveBeenCalled();
    });

    it('works on .toHaveBeenCalledTimes', (): void => {
      const mock = jest.fn(() => 3);

      expect(mock()).toBe(3);
      expect(mock()).toBe(3);

      expect(mock).toHaveBeenCalledTimes(2);
    });

    it('works with .toHaveBeenCalledWith', (): void => {
      const sum = jest.fn((a: number, b: number) => a + b);

      expect(sum(1, 2)).toBe(3);

      expect(sum).toHaveBeenCalledWith(1, 2);

      expect(sum(2, 3)).toBe(5);
      expect(sum(4, 5)).toBe(9);

      expect(sum).toHaveBeenCalledWith(1, 2);
      expect(sum).toHaveBeenCalledWith(2, 3);
      expect(sum).toHaveBeenCalledWith(4, 5);

      expect(sum).toHaveBeenLastCalledWith(4, 5);
    });

    it('works with .toHaveBeenCalledWith & expect.objectContaining', (): void => {
      const test = jest.fn((a: unknown, b: unknown) => !!a && !!b);

      test({ a: 123, b: 'test' }, null);

      expect(test).toHaveBeenLastCalledWith({ a: 123, b: 'test' }, null);
      expect(test).toHaveBeenLastCalledWith(expect.objectContaining({}), null);
      expect(test).toHaveBeenLastCalledWith(expect.objectContaining({ a: 123 }), null);
      expect(test).toHaveBeenLastCalledWith(expect.objectContaining({ b: 'test' }), null);
    });

    it('allows resets', (): void => {
      const mock = jest.fn(() => 3);

      expect(mock).not.toHaveBeenCalled();
      expect(mock()).toBe(3);
      expect(mock).toHaveBeenCalled();

      mock.mockReset();

      expect(mock).not.toHaveBeenCalled();
      expect(mock()).toBe(3);
      expect(mock).toHaveBeenCalled();
    });
  });

  describe('.spyOn', (): void => {
    it('works on .toHaveBeenCalled', (): void => {
      const obj = {
        add: (a: number, b: number) => a + b
      };
      const spy = jest.spyOn(obj, 'add');

      expect(spy).not.toHaveBeenCalled();
      expect(obj.add(1, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('allows resets', (): void => {
      const obj = {
        add: (a: number, b: number) => a + b
      };
      const spy = jest.spyOn(obj, 'add');

      expect(spy).not.toHaveBeenCalled();
      expect(obj.add(1, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockReset();

      expect(spy).not.toHaveBeenCalled();
      expect(obj.add(1, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('allows restores', (): void => {
      const obj = {
        add: (a: number, b: number) => a + b
      };
      const spy = jest.spyOn(obj, 'add');

      expect(spy).not.toHaveBeenCalled();
      expect(obj.add(1, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });
  });
});
