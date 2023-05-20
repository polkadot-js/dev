// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import baseConfig from '@polkadot/dev/config/eslint.config.js';

export default [
  ...baseConfig,
  {
    ignores: [
      'all-deps.js'
    ]
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json'
      }
    }
  }
];
