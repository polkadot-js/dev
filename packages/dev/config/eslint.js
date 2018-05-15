module.exports = {
  parser: 'babel-eslint',
  extends: [
    'semistandard',
    'plugin:flowtype/recommended',
    'plugin:jest/recommended'
  ],
  plugins: [
    'flowtype',
    'jest'
  ],
  globals: {
    'WebAssembly': true
  },
  env: {
    'browser': true,
    'jest/globals': true,
    'node': true
  }
};
