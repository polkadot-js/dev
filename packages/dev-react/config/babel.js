// Copyright 2017-2018 @polkadot/dev-react authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

const base = require('@polkadot/dev/config/babel');

module.exports = Object.keys(base).reduce((config, key) => {
  config[key] = base[key];

  if (key === 'plugins') {
    config[key] = config[key].concat([
      '@babel/plugin-syntax-dynamic-import'
    ]);
  } else if (key === 'presets') {
    config[key] = config[key].concat([
      '@babel/preset-react'
    ]);
  }

  return config;
}, {});
