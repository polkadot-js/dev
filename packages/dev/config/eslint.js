// Copyright 2017-2019 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const BASE_RULES = [
  'eslint:recommended',
  'semistandard',
  'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended'
];

if (!process.env.SKIP_ESLINT_TYPE) {
  BASE_RULES.push('plugin:@typescript-eslint/recommended-requiring-type-checking');
}

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true
  },
  extends: BASE_RULES,
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
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: ['@typescript-eslint'],
  rules: {
    indent: 'off', // required as 'off' by @typescript-eslint/indent
    '@typescript-eslint/indent': ['error', 2]
  },
  settings: {}
};
