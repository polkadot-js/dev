// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { run } from 'node:test';
import TapParser from 'tap-parser';

console.time('\t elapsed :');

const WITH_DEBUG = false;

const files = process.argv.slice(2);
const stats = {
  diag: [],
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

function indent (str = '') {
  return `\t\t\t ${
    str
      .replaceAll('\n', '[&&*&&]')
      .replaceAll('[&&*&&]', '\n\t\t\t ')
  }`;
}

const parser = new TapParser(() => {
  process.stdout.write('\n');

  stats.fail.forEach((r) => {
    WITH_DEBUG && console.error(r);

    console.log();
    console.log('\tx', r.fullname.replaceAll('\n', ' '));
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

  if (stats.fail.length) {
    stats.diag.forEach((e) => console.error(e));
    console.error();
  }

  process.exit(stats.fail.length);
});

// just in-case, we want these logged
// .on('bailout', (r) => console.error('bailout', r))
// .on('error', (r) => console.error('error', r))
// .on('extra', (r) => console.error('extra', r))
// .on('plan', (r) => console.error('plan', r));

parser
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
  });

run({ files, timeout: 60_000 })
  .on('test:diagnostic', (r) => {
    stats.diag.push(r);
  })
  .pipe(parser);
