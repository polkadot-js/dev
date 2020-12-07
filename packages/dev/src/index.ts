// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EchoString } from './types';

import { adder, blah } from './test1';
import { foo } from './test1/foo';
import { addThree } from './util';

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

  return `${count}: ${A}: ${value}`.substr(start, end);
};

function assert (a: boolean): void {
  if (!a) {
    console.log('Failed');
    process.exit(-1);
  }
}

export function tester (): void {
  console.log('Running sanity test');

  assert(adder(2, 4) === 6);
  assert(addThree(1, 2, 3) === 6);
  assert(foo() === 'foobar');

  console.log('Sanity test all ok');
}
