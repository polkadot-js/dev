// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { defaults } = require('jest-config');

module.exports = {
  globals: {
    ...defaults.globals,
    crypto: {
      // https://stackoverflow.com/questions/52612122/how-to-use-jest-to-test-functions-using-crypto-or-window-mscrypto
      getRandomValues: function (arr) {
        return crypto.randomBytes(arr.length).reduce((arr, value, index) => {
          arr[index] = value;

          return arr;
        }, arr);
      }
    }
  },
  moduleFileExtensions: [
    ...defaults.moduleFileExtensions, 'ts', 'tsx'
  ],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  verbose: true
};
