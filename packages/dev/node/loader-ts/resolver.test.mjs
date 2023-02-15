// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { pathToFileURL } from 'node:url';

import { CWD_PATH } from './common.mjs';
import { resolveExtensionJs, resolveExtensionTs, resolveRelative } from './resolver.mjs';

const ROOT_URL = pathToFileURL(`${CWD_PATH}/`);
const SRC_PATH = 'packages/dev/src';
const SRC_URL = pathToFileURL(`${CWD_PATH}/${SRC_PATH}/`);
const INDEX_PATH = `${SRC_PATH}/index.ts`;
const INDEX_URL = pathToFileURL(INDEX_PATH);

describe('resolveExtensionTs', () => {
  it('returns no value for a non .{ts, tsx} extension', () => {
    expect(
      resolveExtensionTs(`./${SRC_PATH}/cjs/sample.js`, ROOT_URL)
    ).not.toBeDefined();
  });

  it('returns a correct object for a .ts extension', () => {
    expect(
      resolveExtensionTs(INDEX_PATH, ROOT_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: INDEX_URL.href
    });
  });
});

describe('resolveExtensionJs', () => {
  const modFound = {
    format: 'module',
    shortCircuit: true,
    url: pathToFileURL(`${CWD_PATH}/${SRC_PATH}/mod.ts`).href
  };

  it('returns the correct value for ./mod.js resolution', () => {
    expect(
      resolveExtensionJs('./mod.js', SRC_URL)
    ).toEqual(modFound);
  });

  it('returns the correct value for ../mod.js resolution', () => {
    expect(
      resolveExtensionJs('../mod.js', pathToFileURL(`${CWD_PATH}/${SRC_PATH}/test1/index.ts`))
    ).toEqual(modFound);
  });
});

describe('resolveRelative', () => {
  const indexFound = {
    format: 'module',
    shortCircuit: true,
    url: INDEX_URL.href
  };

  it('does not resolve non-relative paths', () => {
    expect(
      resolveRelative(INDEX_PATH, ROOT_URL)
    ).not.toBeDefined();
  });

  it('resolves to the index via .', () => {
    expect(
      resolveRelative('.', SRC_URL)
    ).toEqual(indexFound);
  });

  it('resolves to the index via ./index', () => {
    expect(
      resolveRelative('./index', SRC_URL)
    ).toEqual(indexFound);
  });

  it('resolves to the sub-directory via ./test1', () => {
    expect(
      resolveRelative('./test1', SRC_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: pathToFileURL(`${SRC_PATH}/test1/index.ts`).href
    });
  });
});
