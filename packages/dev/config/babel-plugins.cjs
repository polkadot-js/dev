// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const resolver = require('./babel-resolver.cjs');

module.exports = function (isEsm, withExt) {
  return resolver([
    // ordering important, decorators before class properties
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-transform-runtime', { useESModules: isEsm }],
    '@babel/plugin-syntax-bigint',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-syntax-top-level-await',
    'babel-plugin-styled-components',
    // Under Jest the conversion of paths leads to issues since the require would be from e.g.
    // 'index.js', but while executing only the 'index.ts' file would be available (However, in
    // the case of ESM transforms we do need the explicit extension here, so apply it)
    withExt && ['babel-plugin-module-extension-resolver', {
      dstExtension: isEsm ? '.mjs' : '.js',
      srcExtensions: [isEsm ? '.mjs' : '.js', '.ts', '.tsx']
    }]
  ]);
};
