// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

import { CWD_URL, EXT_ARRAY, EXT_REGEX } from './common.mjs';
import { tsAliases } from './tsconfig.mjs';

/**
 * @typedef {{ parentURL: URL }} Context
 * @typedef {{ format: 'commonjs | 'module', shortCircuit?: boolean, url: string }} Resolved
 * @typedef {(specifier: string, context: Context) => Resolved | undefined} Resolver
 */

const EXT_REGEX_JS = /\.jsx?$/;

/**
 * @internal
 *
 * Resolve fully-specified imports with extensions.
 *
 * @param {string} specifier
 * @param {URL} parentUrl
 * @returns {Resolved | undefined}
 **/
export function resolveExtensionTs (specifier, parentUrl) {
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
 * Resolve fully-specified imports with extensions. Here we cater for the TS
 * mapping of import blah from './blah.js' where only './blah.ts' exists
 *
 * TODO: While this is being validated by the tests, this is not actually used
 * interally, i.e. it does not participate in the resolve(..) function. If we
 * we start using `import { a } from './b.js'` inside the polkadot-js codebase
 * we should add it to the chain. (We only use extensionless imports atm, will
 * go to .ts when support does appear)
 *
 * @param {string} specifier
 * @param {URL} parentUrl
 * @returns {Resolved | undefined}
 **/
export function resolveExtensionJs (specifier, parentUrl) {
  // handle ts imports where import *.js -> *.ts
  // (unlike the ts resolution, we only cater for relative paths)
  if (specifier.startsWith('.') && EXT_REGEX_JS.test(specifier)) {
    const full = fileURLToPath(new URL(specifier, parentUrl));

    // when it doesn't exist, we try and see if a source replacement helps
    if (!fs.existsSync(full)) {
      const found = EXT_ARRAY
        .map((e) => full.replace(EXT_REGEX_JS, e))
        .find((f) => fs.existsSync(f) && fs.lstatSync(f).isFile());

      if (found) {
        return {
          format: 'module',
          shortCircuit: true,
          url: pathToFileURL(found).href
        };
      }
    }
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
        // handle . imports for <dir>/index.ts
        EXT_ARRAY
          .map((e) => path.join(dir, `index${e}`))
          .find((f) => fs.existsSync(f)) ||
        // handle the case where parentUrl needs an extension (generally via alias)
        EXT_ARRAY
          .map((e) => `${full}${e}`)
          .find((f) => fs.existsSync(f))
      )
      : (
        // tests to see if this is a file (without extension)
        EXT_ARRAY
          .map((e) => path.join(dir, `${specifier}${e}`))
          .find((f) => fs.existsSync(f)) ||
        // test to see if this is a directory
        EXT_ARRAY
          .map((e) => path.join(dir, `${specifier}/index${e}`))
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
 * ... finally, try the next loader in the chain
 *
 * @param {string} specifier
 * @param {Context} context
 * @param {Resolver} nextResolve
 */
export function resolve (specifier, context, nextResolve) {
  const parentUrl = context.parentURL || CWD_URL;

  return (
    resolveExtensionTs(specifier, parentUrl) ||
    resolveRelative(specifier, parentUrl) ||
    resolveAliases(specifier, parentUrl) ||
    nextResolve(specifier, context)
  );
}
