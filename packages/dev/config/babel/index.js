const isTest = process.env.NODE_ENV === 'test';

const presets = [
  ['@babel/preset-env', {
    'modules': isTest ? 'commonjs' : false,
    'targets': {
      'node': '9'
    },
    'useBuiltIns': 'usage'
  }],
  '@babel/preset-flow'
];

const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-transform-runtime'
];

if (isTest) {
  plugins.push('@polkadot/dev/config/babel/plugin-fix-istanbul');
}

module.exports = {
  presets,
  plugins
};
