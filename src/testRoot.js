// Copyright 2017-2018 Jaco Greeff
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.
// @flow

// flowlint-next-line untyped-import:off
const pkg = require('../package.json');

/**
  @name test
  @signature test (): boolean
  @summary This is the summary for test, a root file
  @description
    This is the description with another line
  @example
    const test = require('./test');

    test(); // => nothing
*/
module.exports = function test (): void {
  console.log(pkg.version);
};
