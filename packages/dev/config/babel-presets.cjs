// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const resolver = require('./babel-resolver.cjs');

const TARGETS_CJS = {
  browsers: '>0.25% and last 2 versions and not ie 11 and not OperaMini all',
  node: '12'
};
const TARGETS_ESM = {
  esmodules: true,
  node: 'current'
};

module.exports = function (modules) {
  return resolver([
    '@babel/preset-typescript',
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    ['@babel/preset-env', {
      modules: modules === 'commonjs'
        ? modules
        : false,
      shippedProposals: modules !== 'commonjs',
      targets: modules === 'commonjs'
        ? TARGETS_CJS
        : TARGETS_ESM
    }]
  ]);
};
