// Copyright 2017-2019 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true
  },
  extends: [
    'semistandard',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': ['error', {
      overrides: {
        constructors: 'no-public'
      }
    }],
    '@typescript-eslint/indent': ['error', 2],
    'indent': 'off' // required by @typescript-eslint/indent
  },
  settings: {}
};
