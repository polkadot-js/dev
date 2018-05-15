const base = require('@polkadot/dev/config/eslint');

module.exports = Object.keys(base).reduce((config, key) => {
  config[key] = base[key];

  if (key === 'extends') {
    config[key] = config[key].concat([
      'standard-jsx',
      'standard-react'
    ]);
  }

  return config;
}, {});
