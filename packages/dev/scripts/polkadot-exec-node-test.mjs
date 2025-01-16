#!/usr/bin/env node
// Copyright 2017-2025 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// For Node 18, earliest usable is 18.14:
//
//   - node:test added in 18.0,
//   - run method exposed in 18.9,
//   - mock in 18.13,
//   - diagnostics changed in 18.14
//
// Node 16 is not supported:
//
//   - node:test added is 16.17,
//   - run method exposed in 16.19,
//   - mock not available

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { run } from 'node:test';

// NOTE error should be defined as "Error", however the @types/node definitions doesn't include all
/** @typedef  {{ details: { error: { failureType: unknown; cause: { code: number; message: string; stack: string; }; code: number; } }; file?: string; name: string }} FailStat */
/** @typedef {{ details: { duration_ms: number }; name: string; }} PassStat */
/** @typedef {{ diag: { file?: string; message?: string; }[]; fail: FailStat[]; pass: PassStat[]; skip: unknown[]; todo: unknown[]; total: number; [key: string]: any; }} Stats */

console.time('\t elapsed :');

const WITH_DEBUG = false;

const args = process.argv.slice(2);
/** @type {string[]} */
const files = [];

/** @type {Stats} */
const stats = {
  diag: [],
  fail: [],
  pass: [],
  skip: [],
  todo: [],
  total: 0
};
/** @type {string | null} */
let logFile = null;
/** @type {number} */
let startAt = 0;
/** @type {boolean} */
let bail = false;
/** @type {boolean} */
let toConsole = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--bail') {
    bail = true;
  } else if (args[i] === '--console') {
    toConsole = true;
  } else if (args[i] === '--logfile') {
    logFile = args[++i];
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

/**
 * @param {FailStat} r
 * @return {string | undefined}
 */
function getFilename (r) {
  if (r.file?.includes('.spec.') || r.file?.includes('.test.')) {
    return r.file;
  }

  if (r.details.error.cause.stack) {
    const stack = r.details.error.cause.stack
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('at ') && (l.includes('.spec.') || l.includes('.test.')))
      .map((l) => l.match(/\(.*:\d\d?:\d\d?\)$/)?.[0])
      .map((l) => l?.replace('(', '')?.replace(')', ''));

    if (stack.length) {
      return stack[0];
    }
  }

  return r.file;
}

function complete() {
  process.stdout.write('\n');

  let logError = '';

  stats.fail.forEach((r) => {
    WITH_DEBUG && console.error(JSON.stringify(r, null, 2));

    let item = '';

    item += indent(1, [getFilename(r), r.name].filter((s) => !!s).join('\n'), 'x ');
    item += indent(2, `${r.details.error.failureType} / ${r.details.error.code}${r.details.error.cause.code && r.details.error.cause.code !== r.details.error.code ? ` / ${r.details.error.cause.code}` : ''}`);

    if (r.details.error.cause.message) {
      item += indent(2, r.details.error.cause.message);
    }

    logError += item;

    if (r.details.error.cause.stack) {
      item += indent(2, r.details.error.cause.stack);
    }

    process.stdout.write(item);
  });

  if (logFile && logError) {
    try {
      fs.appendFileSync(path.join(process.cwd(), logFile), logError);
    } catch (e) {
      console.error(e);
    }
  }

  console.log();
  console.log('\t  passed ::', stats.pass.length);
  console.log('\t  failed ::', stats.fail.length);
  console.log('\t skipped ::', stats.skip.length);
  console.log('\t    todo ::', stats.todo.length);
  console.log('\t   total ::', stats.total);
  console.timeEnd('\t elapsed :');
  console.log();

  // The full error information can be quite useful in the case of overall failures
  if ((stats.fail.length || toConsole) && stats.diag.length) {
    /** @type {string | undefined} */
    let lastFilename = '';

    stats.diag.forEach((r) => {
      WITH_DEBUG && console.error(JSON.stringify(r, null, 2));

      if (typeof r === 'string') {
        console.log(r); // Node.js <= 18.14
      } else if (r.file && r.file.includes('@polkadot/dev/scripts')) {
        // Ignore internal diagnostics
      } else {
        if (lastFilename !== r.file) {
          lastFilename = r.file;

          console.log(lastFilename ? `\n${lastFilename}::\n` : '\n');
        }

        console.log(`\t${r.message?.split('\n').join('\n\t')}`);
      }
    });
    console.log();
  }

  if (toConsole) {
    stats.pass.forEach((r) => {
      console.log(`pass ${r.name} ${r.details.duration_ms} ms`);
    });

    console.log();

    stats.fail.forEach((r) => {
      console.log(`fail ${r.name}`);
    });

    console.log();
  }

  if (stats.total === 0) {
    console.error('FATAL: No tests executed');
    console.error();
    process.exit(1);
  }

  process.exit(stats.fail.length);
}

async function runParallel() {
  const MAX_WORKERS = Math.min(os.cpus().length, files.length);
  const chunks = Math.ceil(files.length / MAX_WORKERS);

  /** @type {string[]} */
  const progress = []; // Collect progress updates from workers

  // Log progress periodically
  const logProgress = setInterval(() => {
    if (progress.length > 0) {
      process.stdout.write(progress.join(''));
      progress.length = 0; // Clear collected progress
    }
  }, 100);

  try {
    // Create and manage worker threads
    const results = await Promise.all(
      Array.from({ length: MAX_WORKERS }, (_, i) => {
        const fileSubset = files.slice(i * chunks, (i + 1) * chunks);

        return new Promise((resolve, reject) => {
          const worker = new Worker(new URL(import.meta.url), {
            workerData: { files: fileSubset },
          });

          worker.on('message', (message) => {
            if (message.type === 'progress') {
              progress.push(message.data);
            } else if (message.type === 'result') {
              resolve(message.data);
            }
          });

          worker.on('error', reject);
          worker.on('exit', (code) => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });
        });
      })
    );

    // Aggregate results from workers
    results.forEach((result) => {
      Object.keys(stats).forEach((key) => {
        if (Array.isArray(stats[key])) {
          stats[key] = stats[key].concat(result[key]);
        } else if (typeof stats[key] === 'number') {
          stats[key] += result[key];
        }
      });
    });

    clearInterval(logProgress);
    complete();
  } catch (err) {
    clearInterval(logProgress);
    console.error('Error during parallel execution:', err);
    process.exit(1);
  }
}



if (isMainThread) {
  console.time('\tElapsed:');
  runParallel();
} else {
  run({ files: workerData.files, timeout: 3_600_000 })
    .on('data', () => undefined)
    .on('end', () => parentPort && parentPort.postMessage(stats))
    .on('test:coverage', () => undefined)
    .on('test:diagnostic', (data) => {
      stats.diag.push(data);
      parentPort && parentPort.postMessage({ type: 'result', data: stats });
    })
    .on('test:fail', (/** @type {any} */ data) => {
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
}