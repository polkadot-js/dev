// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import JSON5 from 'json5';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { CWD_PATH, MOD_PATH } from './common.js';

/** @typedef {{ baseParentUrl: string; filter: string[]; isWildcard?: boolean; path: string }} Alias */
/** @typedef {{ baseUrl?: string; paths?: Record<string, string[]> }} CompilerOptions */
/** @typedef {{ compilerOptions?: CompilerOptions; extends?: string }} JsonConfig */
/** @typedef {{ baseParentUrl: string; basePath: string; paths: Record<string, string[]> }} PartialConfig */

/**
 * @internal
 *
 * Extracts the (relevant) tsconfig info, also using extends
 *
 * @param {string} [currentPath]
 * @param {string} [tsconfig]
 * @returns {PartialConfig}
 **/
function readConfigFile (currentPath = CWD_PATH, tsconfig = 'tsconfig.json') {
  const configPath = path.join(currentPath, tsconfig);

  try {
    /** @type {JsonConfig} */
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf8'));

    // ensure that the basePath does point to an actual directory
    const basePath = config.compilerOptions?.baseUrl || '.';
    let paths = config.compilerOptions?.paths || {};

    if (config.extends) {
      const extRoot = config.extends.startsWith('.')
        ? currentPath
        : MOD_PATH;
      const extSubs = config.extends.split(/[\\/]/);
      const extPath = path.join(extRoot, ...extSubs.slice(0, -1));
      const extConfig = readConfigFile(extPath, extSubs.at(-1));

      // base configs are overridden by later configs, order here matters
      paths = { ...extConfig.paths, ...paths };
    }

    return { baseParentUrl: pathToFileURL(path.join(CWD_PATH, basePath, '/')).href, basePath, paths };
  } catch (error) {
    console.error(`FATAL: Error parsing ${configPath}:: ${error.message}`);

    throw error;
  }
}

/**
 * @internal
 *
 * Retrieves all TS aliases definitions
 *
 * @returns {Alias[]}
 **/
function extractAliases () {
  const { baseParentUrl, paths } = readConfigFile();

  return Object
    .entries(paths)
    // The path value is an array - we only handle the first entry in there,
    // this is a possible fix into the future if it is ever an issue...
    .map(([key, [path]]) => {
      const filter = key.split(/[\\/]/);
      const isWildcard = filter.at(-1) === '*';

      // ensure that when we have wilcards specified, they always occur in the last position
      if ((filter.filter((f) => f === '*').length !== (isWildcard ? 1 : 0)) && key) {
        throw new Error(`FATAL: Wildcards in tsconfig.json path entries are only supported in the last position. Invalid ${key}: ${path} mapping`);
      }

      return {
        baseParentUrl,
        filter: isWildcard
          ? filter.slice(0, -1)
          : filter,
        isWildcard,
        path
      };
    });
}

/** We only export the aliases from the config */
export const tsAliases = extractAliases();
