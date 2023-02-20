// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { run } from 'node:test';
import TapParser from 'tap-parser';

console.time('\t elapsed :');

const files = process.argv.slice(2);
const stats = {
  fail: [],
  pass: [],
  skip: [],
  todo: [],
  total: 0
};

function output (ch) {
  if (stats.total % 100 === 0) {
    process.stdout.write('\n');
  } else if (stats.total % 10 === 0) {
    process.stdout.write('  ');
  } else if (stats.total % 5 === 0) {
    process.stdout.write(' ');
  }

  stats.total++;

  process.stdout.write(ch);
}

function indent (str) {
  return `\t\t\t ${
    str
      .replaceAll('\n', '[&&*&&]')
      .replaceAll('[&&*&&]', '\n\t\t\t ')
  }`;
}

run({
  files,
  timeout: 60_000
}).pipe(
  new TapParser(() => {
    process.stdout.write('\n');

    stats.fail.forEach((r) => {
      console.log();
      console.log(/* '\t✕' */ '\tx', r.fullname);
      console.log();
      console.log('\t\t', r.name);
      console.log();
      console.log(indent(`${r.diag.failureType} / ${r.diag.code}`));
      console.log();
      console.log(indent(r.diag.error));
      console.log();
      console.log(indent(r.diag.stack));
    });

    console.log();
    console.log('\t  passed ::', stats.pass.length);
    console.log('\t  failed ::', stats.fail.length);
    console.log('\t skipped ::', stats.skip.length);
    console.log('\t    todo ::', stats.todo.length);
    console.log('\t   total ::', stats.total);
    console.timeEnd('\t elapsed :');
    console.log();

    process.exit(stats.fail.length);
  })
    .on('fail', (r) => {
      stats.fail.push(r);
      output('x'); // '✕');
    })
    .on('pass', (r) => {
      stats.pass.push(r);
      output('.'); // '·'); // '✔');
    })
    .on('skip', (r) => {
      stats.skip.push(r);
      output('='); // '⁃');
    })
    .on('todo', (r) => {
      stats.todo.push(r);
      output('*'); // '⁃');
    })
);
