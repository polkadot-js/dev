// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

describe('jest', () => {
  it('has been enhanced', () => {
    expect(jest.setTimeout).toBeDefined();
  });

  describe('.fn', () => {
    it('works on .toHaveBeenCalled', () => {
      const mock = jest.fn(() => 3);

      expect(mock).not.toHaveBeenCalled();
      expect(mock()).toBe(3);
      expect(mock).toHaveBeenCalled();
    });

    it('works on .toHaveBeenCalledTimes', () => {
      const mock = jest.fn(() => 3);

      expect(mock()).toBe(3);
      expect(mock()).toBe(3);

      expect(mock).toHaveBeenCalledTimes(2);
    });

    it('works with .toHaveBeenCalledWith', () => {
      const sum = jest.fn((a, b) => a + b);

      expect(sum(1, 2)).toBe(3);

      expect(sum).toHaveBeenCalledWith(1, 2);

      expect(sum(2, 3)).toBe(5);
      expect(sum(4, 5)).toBe(9);

      expect(sum).toHaveBeenCalledWith(1, 2);
      expect(sum).toHaveBeenCalledWith(2, 3);
      expect(sum).toHaveBeenCalledWith(4, 5);

      expect(sum).toHaveBeenLastCalledWith(4, 5);
    });

    it('works with .toHaveBeenCalledWith & expect.objectContaining', () => {
      const test = jest.fn((a, b) => !!a && !!b);

      test({ a: 123, b: 'test' }, null);

      expect(test).toHaveBeenLastCalledWith({ a: 123, b: 'test' }, null);
      expect(test).toHaveBeenLastCalledWith(expect.objectContaining({}), null);
      expect(test).toHaveBeenLastCalledWith(expect.objectContaining({ a: 123 }), null);
      expect(test).toHaveBeenLastCalledWith(expect.objectContaining({ b: 'test' }), null);
    });

    it('allows resets', () => {
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

  describe('.spyOn', () => {
    it('works on .toHaveBeenCalled', () => {
      const obj = {
        add: (a, b) => a + b
      };
      const spy = jest.spyOn(obj, 'add');

      expect(spy).not.toHaveBeenCalled();
      expect(obj.add(1, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('allows resets', () => {
      const obj = {
        add: (a, b) => a + b
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

    it('allows restores', () => {
      const obj = {
        add: (a, b) => a + b
      };
      const spy = jest.spyOn(obj, 'add');

      expect(spy).not.toHaveBeenCalled();
      expect(obj.add(1, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });
  });
});
