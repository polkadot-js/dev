// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const plugins = require('./babel-plugins');
const presets = require('./babel-presets-esnext');
const resolver = require('./babel-resolver');

// ordering here important
/* eslint-disable sort-keys */

module.exports = {
  presets: resolver(presets),
  plugins: resolver([
    ['babel-plugin-module-extension-resolver', {
      dstExtension: '.mjs',
      srcExtensions: ['.ts', '.tsx']
    }],
    ...plugins
  ])
};
