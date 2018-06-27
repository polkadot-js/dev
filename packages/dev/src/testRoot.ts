// Copyright 2017-2018 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import * as pkg from '../package.json';

/**
 * @name test
 * @signature test (): boolean
 * @summary This is the summary for test, a root file
 * @description
 * This is the description with another line
 * @example
 * const test = require('./test');
 *
 * test(); // => nothing
 */
export function test (): void {
  console.log(pkg.version);
}
