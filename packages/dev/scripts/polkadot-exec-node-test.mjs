// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { run } from 'node:test';
import TapParser from 'tap-parser';

console.time('\t elapsed :');

const WITH_DEBUG = false;

const args = process.argv.slice(2);
const files = [];
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
let logFile = null;
let bail = false;
let format = 'dot';
let startAt = 0;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--bail') {
    bail = true;
  } else if (args[i] === '--format') {
    i++;
    format = args[i];
  } else if (args[i] === '--log') {
    i++;
    logFile = args[i];
  } else {
    files.push(args[i]);
  }
}

function output (ch) {
  if (stats.total % 100 === 0) {
    const now = performance.now();

    if (!startAt) {
      startAt = now;
    }

    const elapsed = (now - startAt) / 1000;
    const m = (elapsed / 60) | 0;
    const s = (elapsed - (m * 60));

    process.stdout.write(`\n ${`${m}:${s.toFixed(3).padStart(6, '0')}`.padStart(11)}  `);
  } else if (stats.total % 10 === 0) {
    process.stdout.write('  ');
  } else if (stats.total % 5 === 0) {
    process.stdout.write(' ');
  }

  stats.total++;

  process.stdout.write(ch);
}

function indent (count, str = '', start = '') {
  let pre = '\n';

  switch (count) {
    case 0:
      break;

    case 1:
      pre += '\t';
      break;

    case 2:
      pre += '\t\t';
      break;

    default:
      pre += '\t\t\t';
      break;
  }

  pre += ' ';

  return `${pre}${start}${
    str
      .split('\n')
      .map((l) => l.trim())
      .join(`${pre}${start ? ' '.padStart(start.length, ' ') : ''}`)
  }\n`;
}

function parseComplete () {
  process.stdout.write('\n');

  let logError = '';

  stats.fail.forEach((r) => {
    WITH_DEBUG && console.error(r);

    let item = '';

    if (r.diag) {
      item += indent(1, [...r.fullname.split('\n'), r.name].filter((s) => !!s).join('\n'), 'x ');
      item += indent(2, `${r.diag.failureType} / ${r.diag.code}`);
      item += indent(2, r.diag.error);

      // we don't add the stack to the log-to-file below
      logError += item;

      item += indent(2, r.diag.stack);

      process.stdout.write(item);
    }
  });

  if (logFile && logError) {
    try {
      fs.appendFileSync(path.join(process.cwd(), logFile), logError);
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
}

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
  .pipe(
    format === 'dot'
      ? new TapParser({ bail }, parseComplete)
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
          output('·');
        })
        .on('skip', (r) => {
          stats.skip.push(r);
          output('>');
        })
        .on('todo', (r) => {
          stats.todo.push(r);
          output('!');
        })
      : process.stdout
  );
