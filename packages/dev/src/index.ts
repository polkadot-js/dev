// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EchoString } from './types';

import { blah } from './test1';
import { add } from './util';

const A = 123;
let count = 0;

function doCallback (fn: (a: string) => string): void {
  fn('test');
}

/**
 * This is just a test file to test the doc generation
 */
export const echo = (value: EchoString, start = 0, end?: number): string => {
  count++;

  doCallback((a) => a);
  blah();
  add(1, 2);

  return `${count}: ${A}: ${value}`.substr(start, end);
};
