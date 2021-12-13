#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import yargs from 'yargs';

import { __dirname } from './dirname.mjs';
import execSync from './execSync.mjs';
import forEachPackage from './forEachPackage.mjs';

console.log('$ polkadot-dev-run-lint', process.argv.slice(2).join(' '));

const argv = yargs(process.argv.slice(2))
  .options({
    'skip-eslint': {
      description: 'Skips running eslint',
      type: 'boolean'
    },
    'skip-tsc': {
      description: 'Skips running tsc',
      type: 'boolean'
    }
  })
  .strict()
  .argv;

async function main () {
  if (!argv['skip-eslint']) {
    // We don't want to run with fix on CI
    const extra = process.env.GITHUB_REPOSITORY
      ? ''
      : '--fix';

    execSync(`yarn polkadot-exec-eslint ${extra} --resolve-plugins-relative-to ${__dirname} --ext .js,.cjs,.mjs,.ts,.tsx ${process.cwd()}`);
  }

  if (!argv['skip-tsc']) {
    await forEachPackage(() => Promise.resolve(execSync('yarn polkadot-exec-tsc --noEmit --pretty')));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
