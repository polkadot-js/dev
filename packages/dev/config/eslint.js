// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-expect-error No definition for this one
import eslintJs from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
// @ts-expect-error No definition for this one
import standardConfig from 'eslint-config-standard';
import deprecationPlugin from 'eslint-plugin-deprecation';
// @ts-expect-error No definition for this one
import headerPlugin from 'eslint-plugin-header';
// @ts-expect-error No definition for this one
import importPlugin from 'eslint-plugin-import';
// @ts-expect-error No definition for this one
import importNewlinesPlugin from 'eslint-plugin-import-newlines';
// @ts-expect-error No definition for this one
import jestPlugin from 'eslint-plugin-jest';
// @ts-expect-error No definition for this one
import nPlugin from 'eslint-plugin-n';
// @ts-expect-error No definition for this one
import promisePlugin from 'eslint-plugin-promise';
// @ts-expect-error No definition for this one
import reactPlugin from 'eslint-plugin-react';
// @ts-expect-error No definition for this one
import reactHooksPlugin from 'eslint-plugin-react-hooks';
// @ts-expect-error No definition for this one
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
// @ts-expect-error No definition for this one
import sortDestructureKeysPlugin from 'eslint-plugin-sort-destructure-keys';
import globals from 'globals';

import { allRules, jsRules, jsxRules, specRules } from './eslint.rules.js';

export default [
  eslintJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        project: './tsconfig.eslint.json',
        sourceType: 'module',
        warnOnUnsupportedTypeScriptVersion: false
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      deprecation: deprecationPlugin,
      header: headerPlugin,
      import: importPlugin,
      'import-newlines': importNewlinesPlugin,
      n: nPlugin,
      promise: promisePlugin,
      'simple-import-sort': simpleImportSortPlugin,
      'sort-destructure-keys': sortDestructureKeysPlugin
    },
    settings: {
      'import/extensions': [
        '.cjs',
        '.js',
        '.mjs',
        '.ts',
        '.tsx'
      ],
      'import/parsers': {
        '@typescript-eslint/parser': [
          '.ts',
          '.tsx'
        ],
        espree: [
          '.cjs',
          '.js',
          '.mjs'
        ]
      },
      'import/resolver': {
        node: {
          extensions: [
            '.cjs',
            '.js',
            '.mjs',
            '.ts',
            '.tsx'
          ]
        },
        typescript: {
          project: './tsconfig.eslint.json'
        }
      }
    }
  },
  {
    ignores: [
      '**/.github/',
      '**/.vscode/',
      '**/.yarn/',
      '**/build/',
      '**/build-*/',
      '**/coverage/'
    ]
  },
  {
    files: [
      '**/*.cjs',
      '**/*.js',
      '**/*.mjs',
      '**/*.ts',
      '**/*.tsx'
    ],
    rules: {
      ...standardConfig.rules,
      // ...promisePlugin.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      ...allRules
    }
  },
  {
    files: [
      '**/*.cjs',
      '**/*.js',
      '**/*.mjs'
    ],
    rules: {
      ...jsRules
    }
  },
  {
    files: [
      '**/*.tsx'
    ],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...jsxRules
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx'
    ],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    plugins: {
      jest: jestPlugin
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      ...specRules
    },
    settings: {
      jest: {
        version: 27
      }
    }
  }
];
