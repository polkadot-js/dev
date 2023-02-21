// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { run } from 'node:test';
import TapParser from 'tap-parser';

console.time('\t elapsed :');

const WITH_DEBUG = false;

let logFile = null;
const args = process.argv.slice(2);
const files = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--log') {
    i++;
    logFile = args[i];
  } else {
    files.push(args[i]);
  }
}

const stats = {
  comm: [],
  diag: [],
  extr: [],
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

  let error = '';

  stats.fail.forEach((r) => {
    WITH_DEBUG && console.error(r);

    let item = '';

    if (r.diag) {
      item += `\n\tx ${r.fullname.replaceAll('\n', ' ')}\n`;
      item += `\n\t\t ${r.name}\n`;
      item += `\n${indent(`${r.diag.failureType} / ${r.diag.code}`)}\n`;
      item += `\n${indent(r.diag.error)}\n`;

      error += item;

      item += `\n${indent(r.diag.stack)}\n`;

      console.log(item);
    }
  });

  if (logFile && error) {
    try {
      fs.appendFileSync(path.join(process.cwd(), logFile), error);
    } catch (e) {
      console.error(e);
    }
  }

  [stats.comm, stats.extr].forEach((s) => {
    if (s.length) {
      console.log();
      s.forEach((r) => console.log(r.replaceAll('\n', ' ')));
    }
  });

  console.log();
  console.log('\t  passed ::', stats.pass.length);
  console.log('\t  failed ::', stats.fail.length);
  console.log('\t skipped ::', stats.skip.length);
  console.log('\t    todo ::', stats.todo.length);
  console.log('\t   total ::', stats.total);
  console.timeEnd('\t elapsed :');
  console.log();

  // The full error information can be quite useful in the case of overall
  // failures, i.e. when Node itself has an internal error before even executing
  // a single test
  if (stats.fail.length && stats.diag.length) {
    stats.diag.forEach((e) => console.error(e));
    console.error();
  }

  process.exit(stats.fail.length);
});

parser
  // Ignore the comments for now - it is mostly timing and overlaps with
  // the actual diagnostic information
  //
  // .on('comment', (r) => {
  //   stats.comm.push(r);
  // })
  // .on('extra', (r) => {
  //   stats.extr.push(r);
  // })
  //
  // just in-case, we want these logged
  //
  // .on('bailout', (r) => console.error('bailout', r))
  // .on('plan', (r) => console.error('plan', r))
  .on('fail', (r) => {
    stats.fail.push(r);
    output('x');
  })
  .on('pass', (r) => {
    stats.pass.push(r);
    output('.');
  })
  .on('skip', (r) => {
    stats.skip.push(r);
    output('=');
  })
  .on('todo', (r) => {
    stats.todo.push(r);
    output('*');
  });

// 1hr default timeout ... just in-case something goes wrong on an
// CI-like environment, don't expect this to be hit (never say never)
run({ files, timeout: 3_600_000 })
  .on('test:diagnostic', (r) => {
    stats.diag.push(
      typeof r === 'string'
        // Node v18
        ? r
        // Node v19
        : r.file
          ? `${r.file}:: ${r.message}`
          : r.message
    );
  })
  // .pipe(process.stdout)
  .pipe(parser);
