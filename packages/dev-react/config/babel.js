// Copyright 2017-2019 @polkadot/dev-react authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('@polkadot/dev/config/babel');

module.exports = Object.keys(base).reduce((config, key) => {
  config[key] = base[key];

  if (key === 'plugins') {
    config[key] = config[key].concat([
      '@babel/plugin-syntax-dynamic-import',
      'babel-plugin-styled-components'
    ]);
  } else if (key === 'presets') {
    config[key] = config[key].concat([
      '@babel/preset-react'
    ]);
  }

  return config;
}, {});
