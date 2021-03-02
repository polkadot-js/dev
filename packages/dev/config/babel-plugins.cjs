// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { EXT_CJS, EXT_ESM } = require('./babel-extensions.cjs');
const resolver = require('./babel-resolver.cjs');

module.exports = function (isEsm, withExt) {
  // 1. Under cjs we only add the extension when is is not the default .js
  // 2. Under Jest the conversion of paths leads to issues since the require would be from e.g.
  // 'index.js', but while executing only the 'index.ts' file would be available
  //  3. In the case of esm we always need the explicit extension here
  const rewriteExt = !process.env.JEST_WORKER_ID && withExt && (
    isEsm ||
    EXT_CJS !== '.js'
  );

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
    rewriteExt && ['babel-plugin-module-extension-resolver', {
      dstExtension: isEsm ? EXT_ESM : EXT_CJS,
      srcExtensions: [isEsm ? EXT_ESM : EXT_CJS, '.ts', '.tsx']
    }]
  ]);
};
