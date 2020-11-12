// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Some first test link
 * @link ../testRoot.ts
 */
export default (test: string): string => test;

// eslint config test
export function blah (): void {
  console.log('123');
}

export function adder (a: number, b: number): number {
  return a + b;
}
