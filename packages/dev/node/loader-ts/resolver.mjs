// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

import { CWD_URL, EXT_JS_REGEX, EXT_JSON_REGEX, EXT_TS_ARRAY, EXT_TS_REGEX } from './common.mjs';
import { tsAliases } from './tsconfig.mjs';

// TODO When TypeScript 5 is released it would allow for all *.ts imports.
// The idea is that polkadot-js aligns with the bundler/minimal resolution,
// which in turn could make this loader much simpler.
//
// 1. We certainly don't need the (unused) JS resolution
// 2. Relative import handling will always have the extension (can be dropped)
// 3. Aliases would only need directory resolution

/**
 * @typedef {{ parentURL: URL }} Context
 * @typedef {{ format: 'commonjs | 'module', shortCircuit?: boolean, url: string }} Resolved
 * @typedef {(specifier: string, context: Context) => Resolved | undefined} Resolver
 * @typedef {{ extJs?: boolean, extJson?: boolean, extTs?: boolean, pathAlias?: boolean, pathRelative?: boolean}} Allow
 */

// the resolution modes we actually support here
// (on a per-function basis we do allow overrides for testing)
/** @type {Allow} */
const ALLOW = {
  // we don't use the import x from './somewhere.js' form in polkadot-js
  extJs: false,
  // this is used extensively in the polkadot-js/api repo
  extJson: false,
  // the reason for this actual resolver, so always true
  extTs: true,
  // alias definitions are used in all polkadot-js projects
  pathAlias: true,
  // relative extensionless imports (files and directories) are used
  pathRelative: true
};

/**
 * @internal
 *
 * From a specified URL, extract the actual full path as well as the
 * directory that this path reflects (either equivalent to path or the
 * root of the file being referenced)
 *
 * @param {URL} parentUrl
 * @returns {{ parentDir: string, parentPath: string }}
 */
function getParentPath (parentUrl) {
  const parentPath = fileURLToPath(parentUrl);

  return {
    parentDir: fs.existsSync(parentPath) && fs.lstatSync(parentPath).isDirectory()
      ? parentPath
      : path.dirname(parentPath),
    parentPath
  };
}

/**
 * @internal
 *
 * Resolve fully-specified imports with extensions.
 *
 * @param {string} specifier
 * @param {URL} parentUrl
 * @param {Allow} [allow]
 * @returns {Resolved | undefined}
 **/
export function resolveExtTs (specifier, parentUrl, allow = ALLOW) {
  // handle .ts extensions directly
  if (allow.extTs && EXT_TS_REGEX.test(specifier)) {
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
 * mapping of import foo from './bar.js' where only './bar.ts' exists
 *
 * @param {string} specifier
 * @param {URL} parentUrl
 * @param {Allow} [allow]
 * @returns {Resolved | undefined}
 **/
export function resolveExtJs (specifier, parentUrl, allow = ALLOW) {
  // handle ts imports where import *.js -> *.ts
  // (unlike the ts resolution, we only cater for relative paths)
  if (allow.extJs && specifier.startsWith('.') && EXT_JS_REGEX.test(specifier)) {
    const full = fileURLToPath(new URL(specifier, parentUrl));

    // when it doesn't exist, we try and see if a source replacement helps
    if (!fs.existsSync(full)) {
      const found = EXT_TS_ARRAY
        .map((e) => full.replace(EXT_JS_REGEX, e))
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
 * Resolution for Json files. Generally these would be via path aliasing.
 *
 * @param {string} specifier
 * @param {URL} parentUrl
 * @param {Allow} [allow]
 * @returns {Resolved | undefined}
 */
export function resolveExtJson (specifier, parentUrl, allow = ALLOW) {
  if (allow.extJson && specifier.startsWith('.') && EXT_JSON_REGEX.test(specifier)) {
    const { parentDir } = getParentPath(parentUrl);
    const jsonPath = path.join(parentDir, specifier);

    if (fs.existsSync(jsonPath)) {
      return {
        // .json needs to be in 'json' format for the loader, for the
        // the rest (it should only be TS) we use the 'module' format
        format: 'json',
        shortCircuit: true,
        url: pathToFileURL(jsonPath).href
      };
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
 * @param {Allow} [allow]
 * @returns {Resolved | undefined}
 **/
export function resolveRelative (specifier, parentUrl, allow = ALLOW) {
  if (allow.pathRelative && specifier.startsWith('.')) {
    const { parentDir, parentPath } = getParentPath(parentUrl);
    const found = specifier === '.'
      ? (
        // handle . imports for <dir>/index.ts
        EXT_TS_ARRAY
          .map((e) => path.join(parentDir, `index${e}`))
          .find((f) => fs.existsSync(f)) ||
        // handle the case where parentUrl needs an extension (generally via alias)
        EXT_TS_ARRAY
          .map((e) => `${parentPath}${e}`)
          .find((f) => fs.existsSync(f))
      )
      : (
        // tests to see if this is a file (without extension)
        EXT_TS_ARRAY
          .map((e) => path.join(parentDir, `${specifier}${e}`))
          .find((f) => fs.existsSync(f)) ||
        // test to see if this is a directory
        EXT_TS_ARRAY
          .map((e) => path.join(parentDir, `${specifier}/index${e}`))
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
 * @param {Allow} [allow]
 * @param {typeof tsAliases} [aliases]
 * @returns {Resolved | undefined}
 **/
export function resolveAliases (specifier, _, allow = ALLOW, aliases = tsAliases) {
  if (allow.pathAlias) {
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
      const newSpecifier = initial.length
        ? `./${path.join(...initial)}`
        : '.';
      const newParentUrl = pathToFileURL(found.alias.path).href;

      // do the actual alias resolution
      return (
        resolveRelative(newSpecifier, newParentUrl, allow) ||
        resolveExtJs(newSpecifier, newParentUrl, allow) ||
        resolveExtJson(newSpecifier, newParentUrl, allow)
      );
    }
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
    resolveExtTs(specifier, parentUrl) ||
    resolveRelative(specifier, parentUrl) ||
    resolveAliases(specifier, parentUrl) ||
    resolveExtJs(specifier, parentUrl) ||
    resolveExtJson(specifier, parentUrl) ||
    nextResolve(specifier, context)
  );
}
