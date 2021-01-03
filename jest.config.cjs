// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

const config = require('@polkadot/dev/config/jest.cjs');

module.exports = Object.assign({}, config, {
  modulePathIgnorePatterns: [
    '<rootDir>/packages/dev/build'
  ],
  resolver: '@polkadot/dev/config/jest-resolver.cjs'
});
