// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EchoString } from './types';

const A = 123;
let count = 0;

function doCallback (fn: (a: string) => string): void {
  fn('test');
}

/**
 * This is just a test file to test the doc generation
 */
export const echo = (value: EchoString): string => {
  count++;

  doCallback((a) => a);

  return `${count}: ${A}: ${value}`;
};
