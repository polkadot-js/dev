// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-expect-error We don't particularly wish to add a .d.ts for this
require('@rushstack/eslint-patch/modern-module-resolution');

const path = require('node:path');

const rules = require('./eslint.rules.cjs');

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true
  },
  extends: [
    path.join(__dirname, './eslint-recommended.cjs'),
    require.resolve('eslint-config-standard'),
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended'
  ],
  ignorePatterns: [
    '**/build/*',
    '**/build-*/*',
    '**/coverage/*',
    '**/node_modules/*',
    '/.eslintrc.cjs',
    '/.eslintrc.js',
    '/.eslintrc.mjs',
    '/.github/**',
    '/.prettierrc.cjs',
    '/.vscode/**',
    '/.yarn/**',
    '/babel.config.cjs',
    '/jest.config.cjs',
    '/mod.ts',
    '/rollup.config.js',
    '/rollup.config.mjs'
  ],
  overrides: [
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      rules: rules.js
    },
    {
      files: ['*.spec.ts', '*.spec.tsx'],
      plugins: [
        'jest'
      ],
      rules: rules.spec
    }
  ],
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: [
    '@typescript-eslint',
    'deprecation',
    'header',
    'import',
    'import-newlines',
    'react-hooks',
    'simple-import-sort',
    'sort-destructure-keys'
  ],
  rules: rules.all,
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
