// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const resolver = require('./resolver');

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    ...resolver([
      'eslint-config-standard',
      'eslint-config-semistandard'
    ]),
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended'
  ],
  overrides: [{
    files: ['*.js', '*.spec.js'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  }],
  parser: resolver('@typescript-eslint/parser'),
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: [
    '@typescript-eslint',
    'react-hooks'
  ],
  rules: {
    indent: 'off', // required as 'off' by @typescript-eslint/indent
    '@typescript-eslint/indent': ['error', 2]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
