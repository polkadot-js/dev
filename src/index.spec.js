// ISC, Copyright 2017-2018 Jaco Greeff

const index = require('./');

describe('index', () => {
  it('runs the test', () => {
    expect(index).toBeDefined();
  });

  it('runs the echo function', () => {
    expect(
      index.echo('something')
    ).toEqual('something');
  });
});
