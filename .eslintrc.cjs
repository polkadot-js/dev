// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const base = require('@polkadot/dev/config/eslint.cjs');

module.exports = {
  ...base,
  ignorePatterns: [
    '.eslintrc.cjs',
    '.github/**',
    '.prettierrc.cjs',
    '.vscode/**',
    '.yarn/**',
    'all-deps.js',
    'babel.config.cjs',
    'jest.config.cjs',
    'tester.cjs',
    'tester.mjs',
    '**/build/*',
    '**/coverage/*',
    '**/node_modules/*'
  ],
  parserOptions: {
    ...base.parserOptions,
    project: [
      './packages/**/tsconfig.json'
    ]
  }
};
