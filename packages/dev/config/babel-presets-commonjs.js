// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const shared = require('./babel-presets-shared');

module.exports = [
  ['@babel/preset-env', {
    modules: 'commonjs',
    targets: {
      browsers: '>0.25% and last 2 versions and not ie 11 and not OperaMini all',
      node: '12'
    }
  }],
  ...shared
];
