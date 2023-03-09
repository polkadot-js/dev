// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** This should appear as-is in the output with: 1. extension added, 2. augmented.d.ts correct */
import './augmented.js';

/** This import should appear as-in in the ouput (cjs without asserts) */
import testJson from '@polkadot/dev/rootJs/testJson.json' assert { type: 'json' };

/** Double double work, i.e. re-exports */
export { Clazz } from './Clazz.js';

/** Function to ensure that BigInt does not have the Babel Math.pow() transform */
export function bigIntExp (): bigint {
  // 123_456n * 137_858_491_849n
  return 123_456_789n * (13n ** 10n);
}

/** Function to ensure that dynamic imports work */
export async function dynamic (a: number, b: number): Promise<number> {
  // NOTE we go via this path so it points to the same location in both ESM
  // and CJS output (a './dynamic' import would be different otherwise)
  // @ts-expect-error We don't have a definition
  const { sum } = await import('@polkadot/dev/rootJs/dynamic.mjs');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return sum(a, b);
}

/** Function to ensure we have json correctly imported */
export function json (): string {
  return testJson.test.json;
}

/** Check support for the ?? operator */
export function jsOpExp (a?: number): number {
  return a ?? 42;
}

/** This is an actual check to ensure PURE is all-happy */
export const pureOpExp = /*#__PURE__*/ jsOpExp();
