// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const allRules = {
  // the next 2 enforce isolatedModules & verbatimModuleSyntax
  '@typescript-eslint/consistent-type-exports': 'error',
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
  'func-style': ['error', 'declaration', {
    allowArrowFunctions: true
  }],
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
  'import/export': 'error',
  'import/extensions': ['error', 'ignorePackages', {
    cjs: 'always',
    js: 'always',
    json: 'always',
    jsx: 'never',
    mjs: 'always',
    ts: 'never',
    tsx: 'never'
  }],
  'import/first': 'error',
  'import/newline-after-import': 'error',
  'import/no-duplicates': 'error',
  'import/order': 'off', // conflicts with simple-import-sort
  indent: 'off', // required as 'off' since typescript-eslint has own versions
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
  semi: ['error', 'always'],
  'simple-import-sort/exports': 'error',
  'simple-import-sort/imports': ['error', {
    groups: [
      ['^\u0000'], // all side-effects (0 at start)
      ['\u0000$', '^@polkadot.*\u0000$', '^\\..*\u0000$'], // types (0 at end)
      // ['^node:'], // node
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
};

export const jsxRules = {
  'jsx-quotes': ['error', 'prefer-single'],
  // swap from recommended warning to error
  'react-hooks/exhaustive-deps': 'error',
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
  'react/prop-types': ['off'] // this is a completely broken rule
};

export const jsRules = {
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/restrict-plus-operands': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off'
};

export const specRules = {
  // not sure why ... these started popping up
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  'jest/expect-expect': ['warn', {
    assertFunctionNames: ['assert', 'expect']
  }]
};
