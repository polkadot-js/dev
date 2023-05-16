#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';

import { execSync, mkdirpSync } from './util.mjs';

const tmpDir = 'packages/build';
const tmpFile = `${tmpDir}/CONTRIBUTORS`;

console.log('$ polkadot-dev-contrib', process.argv.slice(2).join(' '));

mkdirpSync(tmpDir);
execSync(`git shortlog master -e -n -s > ${tmpFile}`);

fs.writeFileSync(
  'CONTRIBUTORS',
  Object
    .entries(
      fs
        .readFileSync(tmpFile, 'utf-8')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => !!l)
        .reduce((/** @type {Record<string, { count: number; name: string; }>} */ all, line) => {
          const [c, e] = line.split('\t');
          const count = parseInt(c, 10);
          const [name, rest] = e.split(' <');
          const isExcluded = (
            ['GitHub', 'Travis CI'].some((n) => name.startsWith(n)) ||
            ['>', 'action@github.com>'].some((e) => rest === e) ||
            [name, rest].some((n) => n.includes('[bot]'))
          );

          if (!isExcluded) {
            let [email] = rest.split('>');

            if (!all[email]) {
              email = Object.keys(all).find((k) =>
                name.includes(' ') &&
                all[k].name === name
              ) || email;
            }

            if (all[email]) {
              all[email].count += count;
            } else {
              all[email] = { count, name };
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
    .map(([email, { count, name }], i) => {
      execSync(`git log master -1 --author=${email} > ${tmpFile}-${i}`);

      const commit = fs
        .readFileSync(`${tmpFile}-${i}`, 'utf-8')
        .split('\n')[4]
        .trim();

      return `${`${count}`.padStart(8)}\t${name.padEnd(30)}\t${commit}`;
    })
    .join('\n')
);
