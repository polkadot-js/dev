#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import mkdirp from 'mkdirp';

import execSync from './execSync.mjs';

const tmpDir = 'packages/build';
const tmpFile = `${tmpDir}/CONTRIBUTORS`;

console.log('$ polkadot-dev-contrib', process.argv.slice(2).join(' '));

mkdirp.sync(tmpDir);
execSync(`git shortlog master -e -n -s > ${tmpFile}`);

const all = Object
  .entries(
    fs
      .readFileSync(tmpFile, 'utf-8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => !!l)
      .reduce((all, line) => {
        const [c, e] = line.split('\t');
        const count = parseInt(c, 10);
        const [name, email] = e.split(' <');
        const isExcluded = ['GitHub', 'Travis CI'].some((n) => name.startsWith(n)) ||
          ['>', 'action@github.com>'].some((e) => email === e) ||
          name.includes('[bot]');

        if (!isExcluded) {
          const key = `<${email}`;

          if (all[key]) {
            all[key].count += count;
          } else {
            all[key] = { count, name };
          }
        }

        return all;
      }, {})
  )
  .sort((a, b) => {
    const diff = b[1].count - a[1].count;

    return diff === 0
      ? a[1].name.localeCompare(b[1].name)
      : diff;
  })
  .map(([, { count, name }]) => `${`${count}`.padStart(8)}\t${name}`);

fs.writeFileSync('CONTRIBUTORS', all.join('\n'));
