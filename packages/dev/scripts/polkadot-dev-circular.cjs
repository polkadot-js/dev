#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const chalk = require('chalk');
const madge = require('madge');

console.log('$ polkadot-dev-circular', process.argv.slice(2).join(' '));

madge('./', { fileExtensions: ['ts', 'tsx'] })
  .then((res) => {
    const circular = res.circular();

    if (circular.length) {
      process.stdout.write(chalk.red.bold(`Found ${circular.length} circular dependencies\n`));
    } else {
      process.stdout.write(chalk.bold('No circular dependency found!\n'));
    }

    circular.forEach((path, idx) => {
      process.stdout.write(chalk.dim(`${(idx + 1).toString().padStart(4)}: `));

      path.forEach((module, idx) => {
        if (idx) {
          process.stdout.write(chalk.dim(' > '));
        }

        process.stdout.write(chalk.cyan.bold(module));
      });

      process.stdout.write('\n');
    });

    if (circular.length) {
      throw new Error('failed');
    }
  })
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
