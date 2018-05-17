const isTest = process.env.NODE_ENV === 'test';

const plugins = [
  '@babel/plugin-proposal-class-properties',
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
      },
      useBuiltIns: 'usage'
    }],
    '@babel/preset-flow'
  ],
  plugins
};
