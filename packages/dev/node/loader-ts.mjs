// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader

import { transform } from '@swc/core';
import JSON5 from 'json5';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

const cwdPath = process.cwd();
const cwdURL = pathToFileURL(cwdPath).href;
const extensionsRegex = /\.ts$|\.tsx$/;
const extensions = ['.ts', '.tsx'];
const tsAlias = getTsAliases();

function resolveRegex (specifier, parentURL) {
  // handle .ts extensions directly
  if (extensionsRegex.test(specifier)) {
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL(specifier, parentURL).href
    };
  }
}

function resolveRelative (specifier, parentURL) {
  // handle ./<extensionLess>
  if (specifier.startsWith('.')) {
    const dir = path.dirname(fileURLToPath(parentURL));
    const file = (
      (
        // handle . imports for directories
        specifier === '.' &&
        extensions
          .map((e) => `index${e}`)
          .find((f) => fs.existsSync(path.join(dir, f)))
      ) ||
      (
        // tests to see if this is a file (without extension)
        extensions
          .map((e) => `${specifier}${e}`)
          .find((f) => fs.existsSync(path.join(dir, f)))
      ) ||
      (
        // test to see if this is a directory
        extensions
          .map((e) => `${specifier}/index${e}`)
          .find((f) => fs.existsSync(path.join(dir, f)))
      )
    );

    if (file) {
      return {
        format: 'module',
        shortCircuit: true,
        url: new URL(file, parentURL).href
      };
    }
  }
}

function resolvePackages (specifier) {
  const parts = specifier.split(/[\\/]/);
  const direct = tsAlias
    .filter(({ isStar }) => !isStar)
    .find(({ filter }) =>
      parts.length === filter.length &&
      parts.every((p, i) => p === filter[i])
    );

  if (direct) {
    // this is a fully-specified path
    return resolveRelative('.', pathToFileURL(path.join(cwdPath, direct.path)).href);
  }
}

export function resolve (specifier, context, nextResolve) {
  const { parentURL = cwdURL } = context;

  return (
    resolveRegex(specifier, parentURL) ||
    resolveRelative(specifier, parentURL) ||
    resolvePackages(specifier, parentURL) ||
    nextResolve(specifier, context)
  );
}

export async function load (url, context, nextLoad) {
  if (extensionsRegex.test(url)) {
    // used the chained loaders to retrieve
    const { source } = await nextLoad(url, { ...context, format: 'module' });

    return {
      format: 'module',
      source: await compile(url, source)
    };
  }

  return nextLoad(url, context);
}

async function compile (url, source) {
  // compile - we can also use transformSync
  const result = await transform(source.toString(), {
    filename: fileURLToPath(url),
    jsc: {
      experimental: {
        keepImportAssertions: true
      },
      target: 'es2020'
    },
    sourceMaps: 'inline'
  });

  return result.code;
}

// fills in a tsconfig, taking the extends into account
function readTsConfig (currentPath = cwdPath, tsconfig = 'tsconfig.json') {
  const configPath = path.join(currentPath, tsconfig);

  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf8'));
    const baseUrl = config.compilerOptions?.baseUrl || '.';
    let paths = config.compilerOptions?.paths || {};

    if (config.extends) {
      const extRoot = config.extends.startsWith('.')
        ? currentPath
        : path.join(cwdPath, 'node_modules');
      const extSubs = config.extends.split(/[\\/]/);
      const extPath = path.join(extRoot, ...extSubs.slice(0, -1));
      const extConfig = readTsConfig(extPath, extSubs[extSubs.length - 1]);

      paths = { ...extConfig.paths, ...paths };
    }

    return { baseUrl, paths };
  } catch (error) {
    console.error(`FATAL: Error parsing ${configPath}:: ${error.message}`);

    throw error;
  }
}

// retrieves all ts aliases
function getTsAliases () {
  const { baseUrl, paths } = readTsConfig();

  return Object
    .entries(paths)
    .map(([key, [value]]) => {
      const filter = key.split(/[\\/]/);
      const isStar = filter[filter.length - 1] === '*';

      return {
        filter: isStar
          ? filter.slice(0, -1)
          : filter,
        isStar,
        path: isStar
          ? path.join(cwdPath, baseUrl, ...value.split(/[\\/]/).slice(0, -1))
          : path.join(cwdPath, baseUrl, value)
      };
    });
}
