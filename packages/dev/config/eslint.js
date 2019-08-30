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
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  overrides: [
    {
      files: ['*.js', '*.spec.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // This is for 1.13 behavior, should be adjusted for 2.x
    createDefaultProgram: true
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/indent': ['error', 2],
    indent: 'off' // required as 'off' by @typescript-eslint/indent
  },
  settings: {}
};
