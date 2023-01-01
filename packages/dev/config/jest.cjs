// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [
    ...defaults.moduleFileExtensions,
    'ts',
    'tsx'
  ],
  modulePathIgnorePatterns: ['<rootDir>/build'].concat(
    fs
      .readdirSync('packages')
      .filter((p) => fs.statSync(`packages/${p}`).isDirectory())
      .map((p) => `<rootDir>/packages/${p}/build`)
  ),
  // custom resolver to do TS-like imports
  resolver: require.resolve('./jest-resolver.cjs'),
  // See https://jestjs.io/docs/configuration#extraglobals-arraystring
  sandboxInjectedGlobals: ['Math'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': require.resolve('babel-jest')
  }
};
