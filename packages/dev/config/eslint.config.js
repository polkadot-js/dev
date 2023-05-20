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
import { createRequire } from 'node:module';

import rules from './eslint.rules.cjs';

const require = createRequire(import.meta.url);

export default [
  eslintJs.configs.recommended,
  {
    ignores: [
      '**/.github/',
      '**/.vscode/',
      '**/.yarn/',
      '**/build/',
      '**/build-*/',
      '**/coverage/',
      '.prettierrc.cjs',
      'eslint.config.js',
      'mod.ts',
      'rollup.config.js',
      'rollup.config.mjs'
    ]
  },
  {
    files: [
      '**/*.cjs',
      '**/*.mjs',
      '**/*.js',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.ts',
      '**/*.tsx'
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node
      },
      parser: tsParser,
      parserOptions: {
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
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      'sort-destructure-keys': sortDestructureKeysPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...promisePlugin.configs.recommended.rules,
      ...standardConfig.rules,
      ...rules.all
    },
    settings: {
      'import/extensions': [
        '.js',
        '.ts',
        '.tsx'
      ],
      'import/parsers': {
        '@typescript-eslint/parser': [
          '.ts',
          '.tsx'
        ]
      },
      'import/resolver': require.resolve('eslint-import-resolver-node'),
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: [
      '**/*.cjs',
      '**/*.mjs',
      '**/*.js'
    ],
    rules: {
      ...rules.js
    }
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx'
    ],
    plugins: {
      jest: jestPlugin
    },
    rules: {
      ...rules.spec
    }
  }
];
