// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

import { tsAliases } from './tsconfig.mjs';

const cwdUrl = pathToFileURL(process.cwd()).href;
const extensionsRegex = /\.tsx?$/;
const extensions = ['.ts', '.tsx'];

/**
 * @internal
 *
 * Resolve fully-specified imports with extensions
 **/
export function resolveExtension (specifier, parentUrl) {
  // handle .ts extensions directly
  if (extensionsRegex.test(specifier)) {
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL(specifier, parentUrl).href
    };
  }
}

/**
 * @internal
 *
 * Resolve (extensionless) relative paths
 **/
export function resolveRelative (specifier, parentUrl) {
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
          .map((e) => path.join(dir, `index${e}`))
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

/**
 * @internal
 *
 * Resolve TS alias mappings
 **/
export function resolveAliases (specifier, _, aliases = tsAliases) {
  const parts = specifier.split(/[\\/]/);
  const found = aliases
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

  if (found) {
    // get the initial parts
    const initial = parts.slice(found.alias.filter.length);

    // do the actual import
    return resolveRelative(
      initial.length
        ? `./${path.join(...initial)}`
        : '.',
      pathToFileURL(found.alias.path).href
    );
  }
}

/**
 * Resolves a path using our logic.
 *
 * 1. First we attempt to directly resolve if .ts/.tsx extension is found
 * 2. Then we do relative resolves (this is for extension-less .ts files)
 * 3. The we try to do resolution via TS aliases
 *
 * ... fianlly, try the next loader in the chain
 */
export function resolve (specifier, context, nextResolve) {
  const parentUrl = context.parentURL || cwdUrl;

  return (
    resolveExtension(specifier, parentUrl) ||
    resolveRelative(specifier, parentUrl) ||
    resolveAliases(specifier, parentUrl) ||
    nextResolve(specifier, context)
  );
}
