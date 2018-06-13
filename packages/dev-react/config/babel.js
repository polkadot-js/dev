// Copyright 2017-2018 @polkadot/dev-react authors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.
// @flow

const base = require('@polkadot/dev/config/babel');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = Object.keys(base).reduce((config, key) => {
  config[key] = base[key];

  if (isDev && key === 'plugins') {
    config[key] = config[key].concat([
      'react-hot-loader/babel'
    ]);
  } else if (key === 'presets') {
    config[key] = config[key].concat([
      '@babel/preset-react'
    ]);
  }

  return config;
}, {});
