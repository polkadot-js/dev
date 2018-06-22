// Copyright 2017-2018 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

module.exports = {
  parser: 'babel-eslint',
  extends: [
    'semistandard',
    'plugin:flowtype/recommended',
    'plugin:jest/recommended'
  ],
  plugins: [
    'flowtype',
    'jest'
  ],
  globals: {
    'WebAssembly': true
  },
  env: {
    'browser': true,
    'jest/globals': true,
    'node': true
  },
  rules: {}
};
