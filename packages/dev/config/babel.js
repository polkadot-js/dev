const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    ['@babel/preset-env', {
      'modules': isTest ? 'commonjs' : false,
      'targets': {
        'node': '9'
      },
      'useBuiltIns': 'usage'
    }],
    '@babel/preset-flow'
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-runtime'
  ]
};
