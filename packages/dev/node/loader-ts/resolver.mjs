// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

import { tsAliases } from './tsconfig.mjs';

/**
 * @typedef {{ parentURL: URL }} Context
 * @typedef {{ format: 'commonjs | 'module', shortCircuit?: boolean, url: string }} Resolved
 * @typedef {(specifier: string, context: Context) => Resolved | undefined} Resolver
 */

const EXT_REGEX = /\.tsx?$/;
const EXT_ARR = ['.ts', '.tsx'];

const cwdUrl = pathToFileURL(process.cwd()).href;

/**
 * @internal
 *
 * Resolve fully-specified imports with extensions.
 *
 * @param {string} specifier
 * @param {URL} parentUrl
 * @returns {Resolved | undefined}
 **/
export function resolveExtension (specifier, parentUrl) {
  // handle .ts extensions directly
  if (EXT_REGEX.test(specifier)) {
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
 * Resolve relative (extensionless) paths.
 *
 * At some point we probably might need to extend this to cater for the
 * ts (recommended) approach for using .js extensions inside the sources.
 * However, since we don't use this in the polkadot-js code, can kick this
 * down the line
 *
 * @param {string} specifier
 * @param {URL} parentUrl
 * @returns {Resolved | undefined}
 **/
export function resolveRelative (specifier, parentUrl) {
  if (specifier.startsWith('.')) {
    const full = fileURLToPath(parentUrl);
    const dir = fs.existsSync(full) && fs.lstatSync(full).isDirectory()
      ? full
      : path.dirname(full);
    const found = specifier === '.'
      ? (
        // handle . imports for directories
        EXT_ARR
          .map((e) => path.join(dir, `index${e}`))
          .find((f) => fs.existsSync(f)) ||
        // handle the case where parentUrl needs an extension
        EXT_ARR
          .map((e) => `${full}${e}`)
          .find((f) => fs.existsSync(f))
      )
      : (
        // tests to see if this is a file (without extension)
        EXT_ARR
          .map((e) => `${specifier}${e}`)
          .map((f) => path.join(dir, f))
          .find((f) => fs.existsSync(f)) ||
        // test to see if this is a directory
        EXT_ARR
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
 * Resolve TS alias mappings as defined in the tsconfig.json file
 *
 * @param {string} specifier
 * @param {URL} parentUrl
 * @param {typeof tsAliases} [aliases]
 * @returns {Resolved | undefined}
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
 *
 * @param {string} specifier
 * @param {Context} context
 * @param {Resolver} nextResolve
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
