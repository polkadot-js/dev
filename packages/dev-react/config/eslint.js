// Copyright 2017-2018 Jaco Greeff
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.
// @flow

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
