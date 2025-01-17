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
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { run } from 'node:test';
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';

// NOTE error should be defined as "Error", however the @types/node definitions doesn't include all
/** @typedef {{ file?: string; message?: string; }} DiagStat */
/** @typedef  {{ details: { type: string; duration_ms: number;  error: { message: string; failureType: unknown; stack: string; cause: { code: number; message: string; stack: string; generatedMessage?: any; }; code: number; } }; file?: string; name: string; testNumber: number; nesting: number; }} FailStat */
/** @typedef {{ details: { duration_ms: number }; name: string; }} PassStat */
/** @typedef {{ diag: DiagStat[]; fail: FailStat[]; pass: PassStat[]; skip: unknown[]; todo: unknown[]; total: number; [key: string]: any; }} Stats */

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

/**
 *
 * @param {string[]} progress
 */
const printBuffer = (progress) => {
  if (!startAt) {
    startAt = performance.now();
  }

  const now = performance.now();
  const elapsed = (now - startAt) / 1000;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed - minutes * 60;

  process.stdout.write(`\n ${`${minutes}:${seconds.toFixed(3).padStart(6, '0')}`.padStart(11)}  `);

  for (let i = 0; i < progress.length; i++) {
    process.stdout.write(progress[i]);

    // Add spacing for readability
    if ((i + 1) % 10 === 0) {
      process.stdout.write('  '); // Double space every 10 dots
    } else if ((i + 1) % 5 === 0) {
      process.stdout.write(' '); // Single space every 5 dots
    }
  }
};

function complete () {
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

        // Edge case: We don't need additional noise that is not useful.
        if (!r.message?.split(' ').includes('tests')) {
          console.log(`\t${r.message?.split('\n').join('\n\t')}`);
        }
      }
    });
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

async function runParallel () {
  const MAX_WORKERS = Math.min(os.cpus().length, files.length);
  const chunks = Math.ceil(files.length / MAX_WORKERS);

  /** @type {string[]} */
  const progress = []; // Collect progress updates from workers

  const logProgress = setInterval(() => {
    // Process full rows of 100 dots
    while (progress.length >= 100) {
      const row = progress.splice(0, 100);

      printBuffer(row);
    }

    // Handle leftover dots (less than 100)
    if (progress.length > 0) {
      const leftoverDots = progress.join('');

      // Keep leftover dots for the next interval without printing them
      progress.length = leftoverDots.length;
    }
  }, 100);

  /**
   * Final flush when all tests are done
   * @param {string[]} progress
   */
  function flushProgress (progress) {
    if (progress.length > 0) {
      printBuffer(progress);

      progress.length = 0; // Clear the buffer
    }
  }

  try {
    // Create and manage worker threads
    const results = await Promise.all(
      Array.from({ length: MAX_WORKERS }, (_, i) => {
        const fileSubset = files.slice(i * chunks, (i + 1) * chunks);

        return new Promise((resolve, reject) => {
          const worker = new Worker(new URL(import.meta.url), {
            workerData: { files: fileSubset }
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
    flushProgress(progress);
    complete();
  } catch (err) {
    clearInterval(logProgress);
    flushProgress(progress);
    console.error('Error during parallel execution:', err);
    process.exit(1);
  }
}

if (isMainThread) {
  console.time('\tElapsed:');
  runParallel().catch((err) => console.error(err));
} else {
  run({ files: workerData.files, timeout: 3_600_000 })
    .on('data', () => undefined)
    .on('end', () => parentPort && parentPort.postMessage(stats))
    .on('test:coverage', () => undefined)
    .on('test:diagnostic', (/** @type {DiagStat} */data) => {
      stats.diag.push(data);
      parentPort && parentPort.postMessage({ data: stats, type: 'result' });
    })
    .on('test:fail', (/** @type {FailStat} */ data) => {
      const statFail = structuredClone(data);

      if (data.details.error.cause?.stack) {
        statFail.details.error.cause.stack = data.details.error.cause.stack;
      }

      stats.fail.push(statFail);
      stats.total++;
      parentPort && parentPort.postMessage({ data: 'x', type: 'progress' });

      if (bail) {
        complete();
      }
    })
    .on('test:pass', (data) => {
      const symbol = typeof data.skip !== 'undefined' ? '>' : typeof data.todo !== 'undefined' ? '!' : '·';

      if (symbol === '>') {
        stats.skip.push(data);
      } else if (symbol === '!') {
        stats.todo.push(data);
      } else {
        stats.pass.push(data);
      }

      stats.total++;
      parentPort && parentPort.postMessage({ data: symbol, type: 'progress' });
    })
    .on('test:plan', () => undefined)
    .on('test:start', () => undefined);
}
