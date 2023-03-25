// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** @typedef {{ diag: string[]; total: number }} Stats */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { run } from 'node:test';

console.time('\t elapsed :');

const WITH_DEBUG = false;

const args = process.argv.slice(2);
const files = [];

/** @type {Stats} */
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
let startAt = 0;
let bail = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--bail') {
    bail = true;
  } else if (args[i] === '--log') {
    i++;
    logFile = args[i];
  } else {
    files.push(args[i]);
  }
}

/**
 * @internal
 *
 * Prints a single character on-screen with formatting.
 *
 * @param {string} ch
 */
function output (ch) {
  let result = '';

  if (stats.total % 100 === 0) {
    const now = performance.now();

    if (!startAt) {
      startAt = now;
    }

    const elapsed = (now - startAt) / 1000;
    const m = (elapsed / 60) | 0;
    const s = (elapsed - (m * 60));

    result += `\n ${`${m}:${s.toFixed(3).padStart(6, '0')}`.padStart(11)}  `;
  } else if (stats.total % 10 === 0) {
    result += '  ';
  } else if (stats.total % 5 === 0) {
    result += ' ';
  }

  stats.total++;

  result += ch;

  process.stdout.write(result);
}

/**
 * @internal
 *
 * Performs an indent of the line (and containing lines) with the specific count
 *
 * @param {number} count
 * @param {string} str
 * @param {string} start
 * @returns {string}
 */
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

function complete () {
  process.stdout.write('\n');

  let logError = '';

  stats.fail.forEach((r) => {
    WITH_DEBUG && console.error(r);

    let item = '';

    if (r.details) {
      item += indent(1, [r.file, r.name].filter((s) => !!s).join('\n'), 'x ');
      item += indent(2, `${r.details.error.failureType}/ ${r.details.error.code}`);
      item += indent(2, r.details.error.cause.message);

      // we don't add the stack to the log-to-file below
      logError += item;

      item += indent(2, r.details.error.cause.stack);

      process.stdout.write(item);
    } else if (r.diag) {
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

  if (stats.total === 0) {
    console.error('FATAL: No tests executed');
    console.error();
    process.exit(1);
  }

  process.exit(stats.fail.length);
}

let lastFilename = '';

// 1hr default timeout ... just in-case something goes wrong on an
// CI-like environment, don't expect this to be hit (never say never)
run({ files, timeout: 3_600_000 })
  // this ensures that the stream is switched to flowing mode
  // (which is needed to ensure the end event actually fires)
  .on('data', () => undefined)
  // the stream is done, print the summary and exit
  .on('end', () => complete())
  // handlers for all the known TestStream events from Node
  .on('test:coverage', () => undefined)
  .on('test:diagnostic', (data) => {
    if (typeof data === 'string') {
      // Node.js pre 18.15
      stats.diag.push(data);
    } else if (data.file && data.file.includes('@polkadot/dev/scripts')) {
      // ignore, these are internal
    } else {
      if (lastFilename !== data.file) {
        lastFilename = data.file;

        if (lastFilename) {
          stats.diag.push(`\n${lastFilename}::\n`);
        } else {
          stats.diag.push('\n');
        }
      }

      stats.diag.push(`\t${data.message.split('\n').join('\n\t')}`);
    }
  })
  .on('test:fail', (data) => {
    stats.fail.push(data);
    output('x');

    if (bail) {
      complete();
    }
  })
  .on('test:pass', (data) => {
    if (typeof data.skip !== 'undefined') {
      stats.skip.push(data);
      output('>');
    } else if (typeof data.todo !== 'undefined') {
      stats.todo.push(data);
      output('!');
    } else {
      stats.pass.push(data);
      output('·');
    }
  })
  .on('test:plan', () => undefined)
  .on('test:start', () => undefined);
