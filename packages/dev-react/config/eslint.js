// Copyright 2017-2018 @polkadot/dev-react authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const base = require('@polkadot/dev/config/eslint');

module.exports = Object.keys(base).reduce((config, key) => {
  config[key] = base[key];

  if (key === 'extends') {
    config[key] = config[key].concat([
      'standard-jsx',
      'standard-react'
    ]);
  } else if (key === 'rules') {
    config[key] = Object.assign(config[key], {
      'react/prop-types': 'off'
    });
  }

  return config;
}, {});
