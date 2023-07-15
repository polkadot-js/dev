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

import { overrideAll, overrideJs, overrideJsx, overrideSpec } from './eslint.rules.js';

const EXT_JS = ['.cjs', '.js', '.mjs'];
const EXT_TS = ['.ts', '.tsx'];
const EXT_ALL = [...EXT_JS, ...EXT_TS];

/**
 * @internal
 * Converts a list of EXT_* defined above to globs
 * @param {string[]} exts
 * @returns {string[]}
 */
function extsToGlobs (exts) {
  return exts.map((e) => `**/*${e}`);
}

export default [
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
      'import/extensions': EXT_ALL,
      'import/parsers': {
        '@typescript-eslint/parser': EXT_TS,
        espree: EXT_JS
      },
      'import/resolver': {
        node: {
          extensions: EXT_ALL
        },
        typescript: {
          project: './tsconfig.eslint.json'
        }
      }
    }
  },
  {
    files: extsToGlobs(EXT_ALL),
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...standardConfig.rules,
      ...tsPlugin.configs['recommended-type-checked'].rules,
      ...tsPlugin.configs['stylistic-type-checked'].rules,
      ...overrideAll
    }
  },
  {
    files: extsToGlobs(EXT_JS),
    rules: {
      ...overrideJs
    }
  },
  {
    files: [
      '**/*.tsx',
      '**/use*.ts'
    ],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...overrideJsx
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
      ...overrideSpec
    },
    settings: {
      jest: {
        version: 27
      }
    }
  }
];
