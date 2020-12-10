// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Argv } from 'yargs';
import type { BlahType } from '@polkadot/dev/types';
import type { EchoString } from './types';

import { foo } from './test1/foo';
import { adder, blah } from './test1';
import { addThree } from './util';

const SOMETHING = {
  a: 1,
  b: 2,
  c: 555
};

const A: BlahType = 123;
let count = 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let argv: Argv;

function doCallback (fn: (a: string) => string): void {
  fn('test');
}

/**
 * This is just a test file to test the doc generation
 */
export const echo = (value: EchoString, start = 0, end?: number): string => {
  const { a, b, c } = SOMETHING;

  console.log(a, b, c);

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

  console.log('  (1)', typeof require === 'undefined' ? 'mjs' : 'cjs');

  assert(adder(2, 4) === 6);
  assert(addThree(1, 2, 3) === 6);
  assert(foo() === 'foobar');
}
