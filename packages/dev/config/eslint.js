// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// ordering here important (at least form a rule maintenance pov)
/* eslint-disable sort-keys */

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
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended'
  ],
  overrides: [{
    files: ['*.js', '*.spec.js'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  }],
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'react-hooks',
    'sort-destructure-keys'
  ],
  rules: {
    // required as 'off' by @typescript-eslint/indent, 2 spaces is diff from defaults
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    // rules from semistandard (don't include it, has standard dep version mismatch)
    semi: [2, 'always'],
    'no-extra-semi': 2,
    // no scalable, but it is what it is - need to enable explicitly
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'error', // Checks effect dependencies
    // specific project-based overrides, should really be none
    'arrow-parens': ['error', 'always'],
    'jsx-quotes': ['error', 'prefer-single'],
    'react/jsx-max-props-per-line': [2, { maximum: 1, when: 'always' }],
    'react/jsx-sort-props': [2, { noSortAlphabetically: false }],
    'sort-destructure-keys/sort-destructure-keys': [1, { caseSensitive: true }],
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
