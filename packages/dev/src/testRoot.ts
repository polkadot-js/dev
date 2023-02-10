// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as pkgJson from '../package.json' assert { type: 'json' };

/**
 * This is the description with another line
 *
 * ```
 * const test = require('./test');
 *
 * test(); // => nothing
 * ```
 */
export function test (): void {
  console.warn((pkgJson as unknown as { version: string }).version);
}
