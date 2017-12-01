module.exports = {
  collectCoverage: true,
  testMatch: [
    '**/src/(*.).spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/'
  ],
  verbose: true
};
