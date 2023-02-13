// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader

import JSON5 from 'json5';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const cwdPath = process.cwd();
const modPath = path.join(cwdPath, 'node_modules');

/**
 * @internal
 *
 * Extracts the (relevant) tsconfig info, also using extends
 **/
function readConfigFile (currentPath = cwdPath, tsconfig = 'tsconfig.json') {
  const configPath = path.join(currentPath, tsconfig);

  try {
    const config = JSON5.parse(fs.readFileSync(configPath, 'utf8'));
    const basePath = config.compilerOptions?.baseUrl || '.';
    let paths = config.compilerOptions?.paths || {};

    if (config.extends) {
      const extRoot = config.extends.startsWith('.')
        ? currentPath
        : modPath;
      const extSubs = config.extends.split(/[\\/]/);
      const extPath = path.join(extRoot, ...extSubs.slice(0, -1));
      const extConfig = readConfigFile(extPath, extSubs[extSubs.length - 1]);

      // base configs are overridden by later configs, order here matters
      paths = { ...extConfig.paths, ...paths };
    }

    return { basePath, paths };
  } catch (error) {
    console.error(`FATAL: Error parsing ${configPath}:: ${error.message}`);

    throw error;
  }
}

/**
 * @internal
 *
 * Retrieves all TS aliases definitions
 **/
function extractConfig () {
  const { basePath, paths } = readConfigFile();

  return {
    aliases: Object
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
      }),
    basePath,
    paths
  };
}

export const tsAliases = extractConfig().aliases;
