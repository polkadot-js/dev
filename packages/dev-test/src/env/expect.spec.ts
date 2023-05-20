// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

describe('expect', () => {
  it('has been decorated', () => {
    expect(expect(true).not).toBeDefined();
  });

  it('throws on unimplemented', () => {
    expect(
      () => expect(true).not.toHaveReturnedWith()
    ).toThrow('expect(...).not.toHaveReturnedWith has not been implemented');
  });

  it('throws on unimplemented (with alternative)', () => {
    expect(
      () => expect(true).not.toBeFalsy()
    ).toThrow('expect(...).not.toBeFalsy has not been implemented (Use expect(...).toBeTruthy instead)');
  });

  describe('rejects', () => {
    it('matches a rejection via .toThrow', async () => {
      await expect(
        Promise.reject(new Error('this is a rejection message'))
      ).rejects.toThrow(/rejection/);
    });
  });

  describe('.toBeDefined', () => {
    it('does not throw on null', () => {
      expect(null).toBeDefined();
    });

    it('throws on undefined', () => {
      expect(
        () => expect(undefined).toBeDefined()
      ).toThrow();
    });

    it('.not does not throw on undefined', () => {
      expect(undefined).not.toBeDefined();
    });
  });

  describe('.toThrow', () => {
    const thrower = () => {
      throw new Error('some error');
    };

    it('matches error with empty throw', () => {
      expect(thrower).toThrow();
    });

    it('matches error with exact message', () => {
      expect(thrower).toThrow('some error');
    });

    it('matches error with regex message', () => {
      expect(thrower).toThrow(/me er/);
    });

    it('handles .not correctly (no throw, empty message)', () => {
      expect(() => undefined).not.toThrow();
    });

    it('handles .not correctly (no throw, regex match)', () => {
      expect(() => undefined).not.toThrow(/me er/);
    });

    it('handles .not correctly (throw, string match)', () => {
      expect(() => undefined).not.toThrow('no match');
    });

    it('handles .not correctly (throw, regex match)', () => {
      expect(() => undefined).not.toThrow(/no match/);
    });
  });

  describe('.toMatch', () => {
    it('fails matching when non-object passed in', () => {
      expect(
        () => expect(undefined).toMatch(/match/)
      ).toThrow(/Expected string/);
    });

    it('fails matching when non-matching string passed in', () => {
      expect(
        () => expect('some').toMatch(/match/)
      ).toThrow(/did not match/);
    });

    it('matches string passed', () => {
      expect(
        () => expect('matching').toMatch(/match/)
      ).not.toThrow();
    });
  });

  describe('.toMatchObject', () => {
    it('fails matching when non-object passed in', () => {
      expect(
        () => expect(undefined).toMatchObject({ foo: 'bar' })
      ).toThrow(/Expected object/);
    });

    it('matches empty object', () => {
      expect({
        a: 'foo',
        b: 'bar'
      }).toMatchObject({});
    });

    it('matches object with some fields', () => {
      expect({
        a: 'foo',
        b: 'bar',
        c: 123,
        d: [456, 789]
      }).toMatchObject({
        a: 'foo',
        c: 123,
        d: [456, 789]
      });
    });

    it('matches an object with some expect.stringMatching supplied', () => {
      expect({
        a: 'foo bar',
        b: 'baz',
        c: 'zaz'
      }).toMatchObject({
        a: expect.stringMatching(/o b/),
        b: expect.stringMatching('baz'),
        c: 'zaz'
      });
    });

    it('matches an object with expect.any supplied', () => {
      expect({
        a: 123,
        b: Boolean(true),
        c: 'foo'
      }).toMatchObject({
        a: expect.any(Number),
        b: expect.any(Boolean),
        c: 'foo'
      });
    });

    it('does not match an object with non instance value for expect.any', () => {
      expect(
        () => expect({
          a: true,
          b: 'foo'
        }).toMatchObject({
          a: expect.any(Number),
          b: 'foo'
        })
      ).toThrow(/not an instance of Number/);
    });

    it('matches an object with expect.anything supplied', () => {
      expect({
        a: 123,
        b: 'foo'
      }).toMatchObject({
        a: expect.anything(),
        b: 'foo'
      });
    });

    it('does not match an object with undefined value for expect.anything', () => {
      expect(
        () => expect({
          b: 'foo'
        }).toMatchObject({
          a: expect.anything(),
          b: 'foo'
        })
      ).toThrow(/non-nullish/);
    });

    it('does not match an object with non-array value', () => {
      expect(
        () => expect({
          a: 'foo',
          b: 'bar'
        }).toMatchObject({
          a: 'foo',
          b: [123, 456]
        })
      ).toThrow(/Expected array value/);
    });

    it('allows for deep matching', () => {
      expect({
        a: 123,
        b: {
          c: 456,
          d: {
            e: 'foo',
            f: 'bar',
            g: {
              h: [789, { z: 'baz' }]
            }
          }
        }
      }).toMatchObject({
        a: 123,
        b: {
          c: expect.any(Number),
          d: {
            f: 'bar',
            g: {
              h: [expect.any(Number), { z: 'baz' }]
            }
          }
        }
      });
    });
  });
});
