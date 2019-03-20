// Copyright 2017-2019 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const isTest = process.env.NODE_ENV === 'test';

const plugins = [
  // ordering important, decorators before class properties
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-transform-runtime'
];

if (isTest) {
  plugins.push('@polkadot/dev/config/babel-plugin-fix-istanbul');
}

module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: 'commonjs',
      targets: {
        browsers: [
          'last 2 Chrome versions',
          'last 2 Safari versions',
          'last 2 Firefox versions',
          'last 2 Edge versions'
        ],
        node: '9'
      }
    }],
    '@babel/preset-typescript'
  ],
  plugins
};
