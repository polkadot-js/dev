// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import pluginAlias from '@rollup/plugin-alias';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginDynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import pluginInject from '@rollup/plugin-inject';
import pluginJson from '@rollup/plugin-json';
import { nodeResolve as pluginResolve } from '@rollup/plugin-node-resolve';
import fs from 'node:fs';
import path from 'node:path';
import pluginCleanup from 'rollup-plugin-cleanup';

/** @typedef {{ entries?: Record<string, string>; external: string[]; globals?: Record<string, string>; index?: string; inject?: Record<string, string>; pkg: string; }} BundleDef */
/** @typedef {{ file: string; format: 'umd'; generatedCode: Record<string, unknown>; globals: Record<string, string>; inlineDynamicImports: true; intro: string; name: string; }} BundleOutput */
/** @typedef {{ context: 'global'; external: string[]; input: string; output: BundleOutput; plugins: any[]; }} Bundle */

/**
 * @param {string} pkg
 * @returns {string}
 */
function sanitizePkg (pkg) {
  return pkg.replace('@polkadot/', '');
}

/**
 * @param {string} input
 * @returns {string}
 */
function createName (input) {
  return `polkadot-${sanitizePkg(input)}`
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

/**
 * @param {string} pkg
 * @param {string} [index]
 * @returns {string}
 */
export function createInput (pkg, index) {
  const partialPath = `packages/${sanitizePkg(pkg)}/build`;

  return `${partialPath}/${
    index ||
    fs.existsSync(path.join(process.cwd(), partialPath, 'bundle.js'))
      ? 'bundle.js'
      : (
        JSON.parse(fs.readFileSync(path.join(process.cwd(), partialPath, 'package.json'), 'utf8')).browser ||
        'index.js'
      )
  }`;
}

/**
 *
 * @param {string} pkg
 * @param {string[]} external
 * @param {Record<string, string>} globals
 * @returns {BundleOutput}
 */
export function createOutput (pkg, external, globals) {
  const name = sanitizePkg(pkg);

  return {
    file: `packages/${name}/build/bundle-polkadot-${name}.js`,
    format: 'umd',
    generatedCode: {
      constBindings: true
    },
    globals: external.reduce((all, p) => ({
      [p]: createName(p),
      ...all
    }), { ...globals }),
    // combine multi-chunk builds with dynamic imports
    inlineDynamicImports: true,
    // this is a mini x-global, determine where our context lies
    intro: 'const global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : window;',
    name: createName(pkg)
  };
}

/**
 *
 * @param {BundleDef} param0
 * @returns {Bundle}
 */
export function createBundle ({ entries = {}, external, globals = {}, index, inject = {}, pkg }) {
  return {
    // specify this (we define global in the output intro as globalThis || self || window)
    context: 'global',
    external,
    input: createInput(pkg, index),
    output: createOutput(pkg, external, globals),
    // NOTE The expect-error directives are due to rollup plugins, see
    // - https://github.com/rollup/plugins/issues/1488
    // - https://github.com/rollup/plugins/issues/1329
    plugins: [
      // @ts-expect-error See the linked rollup issues above
      pluginAlias({ entries }),
      // @ts-expect-error See the linked rollup issues above
      pluginJson(),
      // @ts-expect-error See the linked rollup issues above
      pluginCommonjs(),
      // @ts-expect-error See the linked rollup issues above
      pluginDynamicImportVars(),
      // @ts-expect-error See the linked rollup issues above
      pluginInject(inject),
      pluginResolve({ browser: true }),
      pluginCleanup()
    ]
  };
}
