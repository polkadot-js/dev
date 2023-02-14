// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { pathToFileURL } from 'node:url';

import { CWD_PATH } from './common.mjs';
import { resolveExtension, resolveRelative } from './resolver.mjs';

const ROOT_URL = pathToFileURL(`${CWD_PATH}/`);
const SRC_PATH = 'packages/dev/src';
const SRC_URL = pathToFileURL(`${CWD_PATH}/${SRC_PATH}/`);
const INDEX_PATH = `${SRC_PATH}/index.ts`;
const INDEX_URL = pathToFileURL(INDEX_PATH);

describe('resolveExtension', () => {
  it('returns no value for a non .{ts, tsx} extension', () => {
    expect(
      resolveExtension(`./${SRC_PATH}/cjs/sample.js`, ROOT_URL)
    ).not.toBeDefined();
  });

  it('returns a correct object for a .ts extension', () => {
    expect(
      resolveExtension(INDEX_PATH, ROOT_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: INDEX_URL.href
    });
  });
});

describe('resolveRelative', () => {
  it('does not resolve non-relative paths', () => {
    expect(
      resolveRelative(INDEX_PATH, ROOT_URL)
    ).not.toBeDefined();
  });

  it('does resolve to the index via .', () => {
    expect(
      resolveRelative('.', SRC_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: INDEX_URL.href
    });
  });

  it('does resolve to the index via ./index', () => {
    expect(
      resolveRelative('./index', SRC_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: INDEX_URL.href
    });
  });

  it('does resolve to the sub-directory via ./test1', () => {
    expect(
      resolveRelative('./test1', SRC_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: pathToFileURL(`${SRC_PATH}/test1/index.ts`).href
    });
  });
});
