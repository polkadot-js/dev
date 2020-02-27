const base = require('@polkadot/dev/config/eslint');

module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    project: [
      './tsconfig.json'
    ]
  },
  settings: {
    ...base.settings,
    'import/resolver': {
      [require.resolve('./eslint-resolver.js')]: {}
    }
  }
};
