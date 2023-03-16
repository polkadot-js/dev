// Copyright 2017-2023 @polkadot/dev-ts authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference types="@polkadot/dev-test/globals.d.ts" />

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { CWD_PATH } from './common.js';
import { resolveAlias, resolveExtBare, resolveExtJs, resolveExtJson, resolveExtTs } from './resolver.js';

const ROOT_URL = pathToFileURL(`${CWD_PATH}/`);
const SRC_PATH = 'packages/dev/src';
const SRC_URL = pathToFileURL(`${CWD_PATH}/${SRC_PATH}/`);
const INDEX_PATH = `${SRC_PATH}/index.ts`;
const INDEX_URL = pathToFileURL(INDEX_PATH);

describe('resolveExtTs', () => {
  it('returns no value for a non .{ts, tsx} extension', () => {
    expect(
      resolveExtTs(`./${SRC_PATH}/cjs/sample.js`, ROOT_URL)
    ).not.toBeDefined();
  });

  it('returns a correct object for a .ts extension', () => {
    expect(
      resolveExtTs(INDEX_PATH, ROOT_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: INDEX_URL.href
    });
  });
});

describe('resolveExtJs', () => {
  const modFound = {
    format: 'module',
    shortCircuit: true,
    url: pathToFileURL(`${CWD_PATH}/${SRC_PATH}/mod.ts`).href
  };

  it('returns the correct value for ./mod.js resolution', () => {
    expect(
      resolveExtJs('./mod.js', SRC_URL)
    ).toEqual(modFound);
  });

  it('returns the correct value for ../mod.js resolution', () => {
    expect(
      resolveExtJs('../mod.js', pathToFileURL(`${CWD_PATH}/${SRC_PATH}/rootJs/index.ts`))
    ).toEqual(modFound);
  });

  it('returns a correct object for a .jsx extension', () => {
    expect(
      resolveExtJs(`./${SRC_PATH}/rootJs/Jsx.jsx`, ROOT_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: pathToFileURL(`${SRC_PATH}/rootJs/Jsx.tsx`).href
    });
  });
});

describe('resolveExtJson', () => {
  it('resolves .json files', () => {
    expect(
      resolveExtJson('../package.json', SRC_URL)
    ).toEqual({
      format: 'json',
      shortCircuit: true,
      url: pathToFileURL(path.join(SRC_PATH, '../package.json')).href
    });
  });
});

describe('resolveExtBare', () => {
  const indexFound = {
    format: 'module',
    shortCircuit: true,
    url: INDEX_URL.href
  };

  it('does not resolve non-relative paths', () => {
    expect(
      resolveExtBare(INDEX_PATH, ROOT_URL)
    ).not.toBeDefined();
  });

  it('resolves to the index via .', () => {
    expect(
      resolveExtBare('.', SRC_URL)
    ).toEqual(indexFound);
  });

  it('resolves to the index via ./index', () => {
    expect(
      resolveExtBare('./index', SRC_URL)
    ).toEqual(indexFound);
  });

  it('resolves to the sub-directory via ./rootJs', () => {
    expect(
      resolveExtBare('./rootJs', SRC_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: pathToFileURL(`${SRC_PATH}/rootJs/index.ts`).href
    });
  });

  it('resolves to extensionless path', () => {
    expect(
      resolveExtBare('./packageInfo', SRC_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: pathToFileURL(`${SRC_PATH}/packageInfo.ts`).href
    });
  });
});

describe('resolveAliases', () => {
  it('resolves packageInfo', () => {
    expect(
      resolveAlias('@polkadot/dev-ts/packageInfo', ROOT_URL)
    ).toEqual({
      format: 'module',
      shortCircuit: true,
      url: pathToFileURL('packages/dev-ts/src/packageInfo.ts').href
    });
  });
});
