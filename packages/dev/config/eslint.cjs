// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

require('@rushstack/eslint-patch/modern-module-resolution');

const path = require('node:path');

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
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off'
      }
    },
    {
      files: ['*.spec.ts', '*.spec.tsx'],
      plugins: [
        'jest'
      ],
      rules: {
        // not sure why ... these started popping up
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off'
      }
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
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-non-null-assertion': 'error',
    // ts itself checks and ignores those starting with _, align the linting
    '@typescript-eslint/no-unused-vars': ['error', {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      vars: 'all',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/type-annotation-spacing': 'error',
    'arrow-parens': ['error', 'always'],
    'brace-style': ['error', '1tbs'],
    curly: ['error', 'all'],
    'default-param-last': ['off'], // conflicts with TS version (this one doesn't allow TS ?)
    'deprecation/deprecation': 'error',
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    // this does help with declarations, but also
    // applies to invocations, which is an issue...
    // 'function-paren-newline': ['error', 'never'],
    'function-call-argument-newline': ['error', 'consistent'],
    'header/header': ['error', 'line', [
      { pattern: ` Copyright 20(17|18|19|20|21|22)(-${new Date().getFullYear()})? @polkadot/` },
      ' SPDX-License-Identifier: Apache-2.0'
    ], 2],
    'import-newlines/enforce': ['error', {
      forceSingleLine: true,
      items: 2048
    }],
    'import/extensions': ['error', 'ignorePackages', {
      json: 'always',
      jsx: 'never'
    }],
    indent: 'off', // required as 'off' since typescript-eslint has own versions
    'jsx-quotes': ['error', 'prefer-single'],
    'no-extra-semi': 'error',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'object-curly-newline': ['error', {
      ExportDeclaration: { minProperties: 2048 },
      ImportDeclaration: { minProperties: 2048 },
      ObjectPattern: { minProperties: 2048 }
    }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', next: '*', prev: ['const', 'let', 'var'] },
      { blankLine: 'any', next: ['const', 'let', 'var'], prev: ['const', 'let', 'var'] },
      { blankLine: 'always', next: 'block-like', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'block-like' },
      { blankLine: 'always', next: 'function', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'function' },
      { blankLine: 'always', next: 'try', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'try' },
      { blankLine: 'always', next: 'return', prev: '*' },
      { blankLine: 'always', next: 'import', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'import' },
      { blankLine: 'any', next: 'import', prev: 'import' }
    ],
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-closing-bracket-location': ['warn', 'tag-aligned'],
    'react/jsx-first-prop-new-line': ['warn', 'multiline-multiprop'],
    'react/jsx-fragments': 'error',
    'react/jsx-max-props-per-line': ['warn', {
      maximum: 1,
      when: 'always'
    }],
    'react/jsx-newline': ['error', {
      prevent: true
    }],
    'react/jsx-no-bind': 'error',
    'react/jsx-props-no-multi-spaces': 'error',
    'react/jsx-sort-props': ['warn', {
      noSortAlphabetically: false
    }],
    'react/jsx-tag-spacing': ['error', {
      afterOpening: 'never',
      beforeClosing: 'never',
      beforeSelfClosing: 'always',
      closingSlash: 'never'
    }],
    'react/prop-types': ['off'], // this is a completely broken rule
    semi: ['error', 'always'],
    'simple-import-sort/imports': ['error', {
      groups: [
        ['^\u0000'], // all side-effects (0 at start)
        ['\u0000$', '^@polkadot.*\u0000$', '^\\..*\u0000$'], // types (0 at end)
        ['^[^/\\.]'], // non-polkadot
        ['^@polkadot'], // polkadot
        ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'] // local (. last)
      ]
    }],
    'sort-destructure-keys/sort-destructure-keys': ['error', {
      caseSensitive: true
    }],
    'sort-keys': 'error',
    'spaced-comment': ['error', 'always', {
      block: {
        // pure export helpers
        markers: ['#__PURE__']
      },
      line: {
        // TS reference types
        markers: ['/ <reference']
      }
    }]
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
