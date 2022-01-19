// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { EXT_CJS, EXT_ESM } = require('./babel-extensions.cjs');
const resolver = require('./babel-resolver.cjs');

module.exports = function (isEsm) {
  return resolver([
    // ordering important, decorators before class properties
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-transform-runtime', { useESModules: isEsm }],
    '@babel/plugin-syntax-bigint',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-syntax-top-level-await',
    'babel-plugin-styled-components',
    !process.env.JEST_WORKER_ID && ['babel-plugin-module-extension-resolver', {
      dstExtension: isEsm ? EXT_ESM : EXT_CJS,
      srcExtensions: [isEsm ? EXT_ESM : EXT_CJS, '.ts', '.tsx']
    }]
  ]);
};
