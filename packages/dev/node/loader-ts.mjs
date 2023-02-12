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
const cwdUrl = pathToFileURL(cwdPath).href;
const extensionsRegex = /\.tsx?$/;
const extensions = ['.ts', '.tsx'];
const tsAlias = getTsAliases();

/** @internal Resolve fully-specified imports with extensions */
function resolveExtension (specifier, parentUrl) {
  // handle .ts extensions directly
  if (extensionsRegex.test(specifier)) {
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL(specifier, parentUrl).href
    };
  }
}

/** @internal Resolve (extensionless) relative paths */
function resolveRelative (specifier, parentUrl) {
  // handle ./<extensionLess>
  if (specifier.startsWith('.')) {
    const full = fileURLToPath(parentUrl);
    const dir = fs.existsSync(full) && fs.lstatSync(full).isDirectory()
      ? full
      : path.dirname(full);
    const found = specifier === '.'
      ? (
        // handle . imports for directories
        extensions
          .map((e) => `index${e}`)
          .map((f) => path.join(dir, f))
          .find((f) => fs.existsSync(f)) ||
        // handle the case where parentUrl needs an extension
        extensions
          .map((e) => `${full}${e}`)
          .find((f) => fs.existsSync(f))
      )
      : (
        // tests to see if this is a file (without extension)
        extensions
          .map((e) => `${specifier}${e}`)
          .map((f) => path.join(dir, f))
          .find((f) => fs.existsSync(f)) ||
        // test to see if this is a directory
        extensions
          .map((e) => `${specifier}/index${e}`)
          .map((f) => path.join(dir, f))
          .find((f) => fs.existsSync(f))
      );

    if (found) {
      return {
        format: 'module',
        shortCircuit: true,
        url: pathToFileURL(found).href
      };
    }
  }
}

/** @internal Resolve TS aliase mappings */
function resolveAliases (specifier) {
  const parts = specifier.split(/[\\/]/);
  const entry = tsAlias
    .values
    // return a [filter, [...partIndex]] mapping
    .map((alias) => ({
      alias,
      indexes: parts
        .map((_, i) => i)
        .filter((start) =>
          // parts should have more entries than the wildcard
          parts.length >= alias.filter.length &&
          // match all parts of the alias (excluding last wilcard)
          alias.filter.every((f, i) =>
            parts[start + i] &&
            parts[start + i] === f
          )
        )
    }))
    // we only return the first
    .find(({ indexes }) => indexes.length);

  if (entry) {
    // get the initial parts
    const initial = parts.slice(entry.alias.filter.length);

    // do the actual import
    return resolveRelative(
      initial.length
        ? `./${path.join(...initial)}`
        : '.',
      pathToFileURL(entry.alias.path).href
    );
  }
}

/** @summary Try and perform a resolve */
export function resolve (specifier, context, nextResolve) {
  const parentUrl = context.parentURL || cwdUrl;

  return (
    resolveExtension(specifier, parentUrl) ||
    resolveRelative(specifier, parentUrl) ||
    resolveAliases(specifier, parentUrl) ||
    nextResolve(specifier, context)
  );
}

/** @summary Load TS files, compiling via swc */
export async function load (url, context, nextLoad) {
  if (extensionsRegex.test(url)) {
    // used the chained loaders to retrieve
    const { source } = await nextLoad(url, { ...context, format: 'module' });
    // compile via swc - we can also use transformSync
    const { code } = await transform(source.toString(), {
      filename: fileURLToPath(url),
      jsc: {
        experimental: {
          keepImportAssertions: true
        },
        target: 'es2020'
      },
      sourceMaps: 'inline'
    });

    return {
      format: 'module',
      source: code
    };
  }

  return nextLoad(url, context);
}

/** @internal Extracts the (relevant) tsconfig info, also using extends */
function readTsConfig (currentPath = cwdPath, tsconfig = 'tsconfig.json') {
  const configPath = path.join(currentPath, tsconfig);

  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf8'));
    const basePath = config.compilerOptions?.baseUrl || '.';
    let paths = config.compilerOptions?.paths || {};

    if (config.extends) {
      const extRoot = config.extends.startsWith('.')
        ? currentPath
        : path.join(cwdPath, 'node_modules');
      const extSubs = config.extends.split(/[\\/]/);
      const extPath = path.join(extRoot, ...extSubs.slice(0, -1));
      const extConfig = readTsConfig(extPath, extSubs[extSubs.length - 1]);

      // base configs are overridden by later configs, order here matters
      paths = { ...extConfig.paths, ...paths };
    }

    return { basePath, paths };
  } catch (error) {
    console.error(`FATAL: Error parsing ${configPath}:: ${error.message}`);

    throw error;
  }
}

/** @internal Retrieves all TS aliases definitions */
function getTsAliases () {
  const { basePath, paths } = readTsConfig();

  return {
    basePath,
    values: Object
      .entries(paths)
      // The path value is an array - we only handle the first entry in there,
      // this is a possible fix into the future if it is ever an issue...
      .map(([key, [value]]) => {
        const filter = key.split(/[\\/]/);
        const pathSplit = value.split(/[\\/]/);
        const isWildcard = filter[filter.length - 1] === '*';
        const isWildcardPath = pathSplit[pathSplit.length - 1] === '*';

        // ensure that when we have wilcards specified, they always occur in the last position
        const pathErr = (
          ((filter.filter((f) => f === '*').length !== (isWildcard ? 1 : 0)) && key) ||
          ((pathSplit.filter((f) => f === '*').length !== (isWildcardPath ? 1 : 0)) && value)
        );

        if (pathErr) {
          throw new Error(`FATAL: Wildcards in tsconfig.json path entries are only supported in the last position. Invalid ${key}: ${value} mapping`);
        }

        return {
          filter: isWildcard
            ? filter.slice(0, -1)
            : filter,
          isWildcard,
          path: isWildcardPath
            // for wilcards exclude the last value
            ? path.join(cwdPath, basePath, ...pathSplit.slice(0, -1))
            // for non-wilcards, we just return a full path
            : path.join(cwdPath, basePath, value)
        };
      })
  };
}
