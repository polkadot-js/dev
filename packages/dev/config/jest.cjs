// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [
    ...defaults.moduleFileExtensions, 'ts', 'tsx'
  ],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  verbose: true
};
