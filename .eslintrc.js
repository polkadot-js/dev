// Copyright 2017-2019 @polkadot/dev-react authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const base = require('@polkadot/dev-react/config/eslint');

module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    extraFileExtensions: ['*.d.ts'],
    project: [
      './tsconfig.eslint.json'
    ]
  }
};
