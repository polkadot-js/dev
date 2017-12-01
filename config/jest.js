module.exports = {
  collectCoverage: true,
  testMatch: [
    '**/(*.)spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/'
  ],
  verbose: true
};
