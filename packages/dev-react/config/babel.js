const base = require('@polkadot/dev/config/babel');

module.exports = Object.keys(base).reduce((config, key) => {
  config[key] = base[key];

  if (key === 'presets') {
    const env = config[key].find((item) => item[0] === '@babel/preset-env');

    env[1].targets.browsers = [
      'last 2 Chrome versions',
      'last 2 Safari versions',
      'last 2 Firefox versions',
      'last 2 Edge versions'
    ];

    config[key] = config[key].concat([
      '@babel/preset-react'
    ]);
  }

  return config;
}, {});
