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

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--log') {
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
 * @returns {string}
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

  return result;
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

async function * reporter (source) {
  for await (const { data, type } of source) {
    switch (type) {
      case 'test:coverage': {
        break;
      }

      case 'test:diagnostic': {
        stats.diag.push(
          typeof data === 'string'
            // Node v18
            ? data
            // Node v19
            : data.file
              ? `${data.file}:: ${data.message}`
              : data.message
        );
        break;
      }

      case 'test:fail': {
        stats.fail.push(data);
        yield output('x');
        break;
      }

      case 'test:pass': {
        if (typeof data.skip !== 'undefined') {
          stats.skip.push(data);
          yield output('>');
        } else if (typeof data.todo !== 'undefined') {
          stats.todo.push(data);
          yield output('!');
        } else {
          stats.pass.push(data);
          yield output('·');
        }

        break;
      }

      case 'test:plan': {
        break;
      }

      case 'test:start': {
        break;
      }

      default: {
        // Unhandled - should not gete here at all
        break;
      }
    }
  }

  complete();
}

// 1hr default timeout ... just in-case something goes wrong on an
// CI-like environment, don't expect this to be hit (never say never)
run({ files, timeout: 3_600_000 })
  .compose(reporter)
  .pipe(process.stdout);
