module.exports = {
  presets: [
    ['@babel/preset-env', {
      'modules': false,
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
