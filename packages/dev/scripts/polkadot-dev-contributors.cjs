#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { spawnSync } = require('child_process');
const fs = require('fs');

const child = spawnSync('git', ['--no-pager', 'shortlog', '--summary', '--numbered', '--email'], {
  encoding: 'utf-8',
  stdio: ['inherit', 'pipe', 'pipe']
});

const contributions = child.stdout
  .split('\n')
  .filter((l) =>
    l.includes('\t') &&
    !(
      l.startsWith('Travis CI') ||
      l.startsWith('GitHub') ||
      l.includes('<>') ||
      l.includes('<action@github.com>') ||
      l.includes('[bot]')
    )
  )
  .map((l) => l.split('\t'))
  .map(([count, author]) => {
    const [name, email] = author.split(' <');

    return [parseInt(count.trim()), name, `<${email}`];
  })
  .reduce((all, [count, name, email]) => {
    const first = all.find(([, n, e]) => {
      if (e === email) {
        return true;
      } else if (n === name) {
        const [userA, providerA] = email.split('@');
        const [userB, providerB] = email.split('@');

        return userA === userB || providerA === providerB;
      }

      return false;
    });

    if (first) {
      first[0] += count;
    } else {
      all.push([count, name, email]);
    }

    return all;
  }, [])
  .sort((a, b) => b[0] - a[0])
  .map(([count, name, email]) => `${count.toString().padStart(8)}    ${name} ${email}`)
  .join('\n');

fs.writeFileSync('CONTRIBUTIONS', `${contributions}\n`);
