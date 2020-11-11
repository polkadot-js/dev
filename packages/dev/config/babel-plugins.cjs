// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const resolver = require('./babel-resolver.cjs');

module.exports = function (dstExtension) {
  return resolver([
    // ordering important, decorators before class properties
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'fsharp' }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-bigint',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-syntax-top-level-await',
    'babel-plugin-styled-components',
    process.env.NODE_ENV === 'test' && '@polkadot/dev/config/babel-plugin-fix-istanbul.cjs',
    dstExtension && process.env.NODE_ENV !== 'test' && ['babel-plugin-module-extension-resolver', {
      dstExtension,
      srcExtensions: ['.ts', '.tsx']
    }]
  ]);
};
