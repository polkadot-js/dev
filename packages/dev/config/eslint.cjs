// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// ordering here important (at least from a rule maintenance pov)
/* eslint-disable sort-keys */

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    require.resolve('eslint-config-standard'),
    // 'plugin:import/errors',
    // 'plugin:import/warnings',
    // 'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended'
  ],
  overrides: [{
    files: ['*.js', '*.spec.js', '*.cjs', '*.mjs'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off'
    }
  }],
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    extraFileExtensions: ['.cjs'],
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: [
    '@typescript-eslint',
    'header',
    'import',
    'react-hooks',
    'sort-destructure-keys'
  ],
  rules: {
    // required as 'off' since typescript-eslint has own versions
    indent: 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/indent': ['error', 2],
    // rules from semistandard (don't include it, has standard dep version mismatch)
    semi: [2, 'always'],
    'no-extra-semi': 2,
    // specific overrides
    'arrow-parens': ['error', 'always'],
    'default-param-last': [0], // conflicts with TS version (this one doesn't allow TS ?)
    'header/header': [2, 'line', [
      { pattern: ' Copyright \\d{4}(-\\d{4})? @polkadot/' },
      ' SPDX-License-Identifier: Apache-2.0'
    ]],
    'jsx-quotes': ['error', 'prefer-single'],
    'react/prop-types': [0], // this is a completely broken rule
    'object-curly-newline': ['error', {
      ImportDeclaration: { minProperties: 2048 }
    }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: '*', next: 'try' },
      { blankLine: 'always', prev: 'try', next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' }
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-max-props-per-line': [2, {
      maximum: 1,
      when: 'always'
    }],
    'react/jsx-sort-props': [2, {
      noSortAlphabetically: false
    }],
    'sort-destructure-keys/sort-destructure-keys': [2, {
      caseSensitive: true
    }],
    'sort-keys': 'error'
  },
  settings: {
    'import/extensions': ['.js', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': require.resolve('eslint-import-resolver-node'),
    react: {
      version: 'detect'
    }
  }
};
