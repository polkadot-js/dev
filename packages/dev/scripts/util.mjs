// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import url from 'node:url';

/** @internal logging */
const BLANK = ''.padStart(75);

/** CJS/ESM compatible __dirname */
export const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/** Deno prefix for externals */
export const DENO_EXT_PRE = 'https://esm.sh';

/** Deno prefix for built-ins */
export const DENO_LND_PRE = 'https://deno.land';

/** Deno prefix for the polkadot package */
export const DENO_POL_PRE = `${DENO_LND_PRE}/x/polkadot`;

/** The GH user that we use for actions */
export const GITHUB_USER = 'github-actions[bot]';

/** The GH email for actions */
export const GITHUB_MAIL = '41898282+github-actions[bot]@users.noreply.github.com';

/** The GH repo link */
export const GITHUB_REPO = process.env['GITHUB_REPOSITORY'];

/** The GH token */
export const GITHUB_TOKEN = process.env['GH_PAT'];

/** The GH repo URL */
export const GITHUB_TOKEN_URL = `https://${GITHUB_TOKEN}@github.com`;

/** Paths that we generally building to (catch-all for possible usages) */
export const PATHS_BUILD = ['', '-cjs', '-esm'].reduce((r, a) => r.concat(['', '-babel', '-esbuild', '-swc', '-tsc'].map((b) => `${b}${a}`)), ['-deno', '-docs', '-loader', '-wasm']).sort();

/** Paths that are generally excluded from source operations */
export const PATHS_EXCL = ['node_modules', ...PATHS_BUILD.map((e) => `build${e}`)];

/**
 * Copy a file to a target dir
 *
 * @param {string | string[]} src
 * @param {string} destDir
 **/
export function copyFileSync (src, destDir) {
  if (Array.isArray(src)) {
    src.forEach((s) => copyFileSync(s, destDir));
  } else {
    fs.copyFileSync(src, path.join(destDir, path.basename(src)));
  }
}

/**
 * Recursively copies a directory to a target dir
 *
 * @param {string | string[]} src
 * @param {string} dest
 * @param {string[]} [include]
 * @param {string[]} [exclude]
 **/
export function copyDirSync (src, dest, include, exclude) {
  if (Array.isArray(src)) {
    src.forEach((s) => copyDirSync(s, dest, include, exclude));
  } else if (!fs.existsSync(src)) {
    // it doesn't exist, so we have nothing to copy
  } else if (!fs.statSync(src).isDirectory()) {
    exitFatal(`Source ${src} should be a directory`);
  } else {
    mkdirpSync(dest);

    fs
      .readdirSync(src)
      .forEach((file) => {
        const srcPath = path.join(src, file);

        if (fs.statSync(srcPath).isDirectory()) {
          copyDirSync(srcPath, path.join(dest, file), include, exclude);
        } else if (!include?.length || include.some((e) => file.endsWith(e))) {
          if (!exclude || !exclude.some((e) => file.endsWith(e))) {
            copyFileSync(srcPath, dest);
          }
        }
      });
  }
}

/**
 * Creates a deno directory name
 *
 * @param {string} name
 * @returns {string}
 **/
export function denoCreateDir (name) {
  // aligns with name above - since we have sub-paths, we only return
  // the actual path inside packages/* (i.e. the last part of the name)
  return name.replace('@polkadot/', '');
}

/**
 * @internal
 *
 * Adjusts the engine setting, highest of current and requested
 *
 * @param {string} [a]
 * @param {string} [b]
 * @returns {number}
 */
export function engineVersionCmp (a, b) {
  const aVer = engineVersionSplit(a);
  const bVer = engineVersionSplit(b);

  for (let i = 0; i < 3; i++) {
    if (aVer[i] < bVer[i]) {
      return -1;
    } else if (aVer[i] > bVer[i]) {
      return 1;
    }
  }

  return 0;
}

/**
 * @internal
 *
 * Splits a engines version, i.e. >=xx(.yy) into
 * the major/minor/patch parts
 *
 * @param {string} [ver]
 * @returns {[number, number, number]}
 */
export function engineVersionSplit (ver) {
  const parts = (ver || '>=0')
    .replace('v', '') // process.version returns v18.14.0
    .replace('>=', '') // engines have >= prefix
    .split('.')
    .map((e) => e.trim());

  return [parseInt(parts[0] || '0', 10), parseInt(parts[1] || '0', 10), parseInt(parts[2] || '0', 10)];
}

/**
 * Process execution
 *
 * @param {string} cmd
 * @param {boolean} [noLog]
 **/
export function execSync (cmd, noLog) {
  const exec = cmd
    .replace(/ {2}/g, ' ')
    .trim();

  if (!noLog) {
    console.log(`$ ${exec}`);
  }

  cp.execSync(exec, { stdio: 'inherit' });
}

/**
 * Node execution with ts support
 *
 * @param {string} cmd
 * @param {string[]} [nodeFlags]
 * @param {boolean} [noLog]
 * @param {string} [loaderPath]
 **/
export function execNodeTsSync (cmd, nodeFlags = [], noLog, loaderPath = '@polkadot/dev-ts/cached') {
  const loadersGlo = [];
  const loadersLoc = [];
  const otherFlags = [];

  for (let i = 0; i < nodeFlags.length; i++) {
    const flag = nodeFlags[i];

    if (['--import', '--loader', '--require'].includes(flag)) {
      const arg = nodeFlags[++i];

      // We split the loader arguments based on type in execSync. The
      // split here is to extract the various provided types:
      //
      // 1. Global loaders are added first, then
      // 2. Our specific dev-ts loader is added, then
      // 3. Any provided local loaders are added
      //
      // The ordering requirement here is driven from the use of global
      // loaders inside the apps repo (specifically extensionless), while
      // ensuring we don't break local loader usage in the wasm repo
      if (arg.startsWith('.')) {
        loadersLoc.push(flag);
        loadersLoc.push(arg);
      } else {
        loadersGlo.push(flag);
        loadersGlo.push(arg);
      }
    } else {
      otherFlags.push(flag);
    }
  }

  execSync(`${process.execPath} ${otherFlags.join(' ')} --no-warnings --enable-source-maps ${loadersGlo.join(' ')} --loader ${loaderPath} ${loadersLoc.join(' ')} ${cmd}`, noLog);
}

/**
 * Node binary execution
 *
 * @param {string} name
 * @param {string} cmd
 **/
export function execViaNode (name, cmd) {
  const args = process.argv.slice(2).join(' ');

  console.log(`$ ${name} ${args}`.replace(/ {2}/g, ' ').trim());

  return execSync(`${importPath(cmd)} ${args}`, true);
}

/** A consistent setup for git variables */
export function gitSetup () {
  execSync(`git config user.name "${GITHUB_USER}"`);
  execSync(`git config user.email "${GITHUB_MAIL}"`);

  execSync('git config push.default simple');
  execSync('git config merge.ours.driver true');

  execSync('git checkout master');
}

/**
 * Create an absolute import path into node_modules from a
 * <this module> module name
 *
 * @param {string} req
 * @returns {string}
 **/
export function importPath (req) {
  return path.join(process.cwd(), 'node_modules', req);
}

/**
 * Do an async import
 *
 * @param {string} bin
 * @param {string} req
 * @returns {Promise<any>}
 **/
export async function importDirect (bin, req) {
  console.log(`$ ${bin} ${process.argv.slice(2).join(' ')}`);

  try {
    const mod = await import(req);

    return mod;
  } catch (/** @type {any} */ error) {
    exitFatal(`Error importing ${req}`, error);
  }
}

/**
 * Do a relative async import
 *
 * @param {string} bin
 * @param {string} req
 * @returns {Promise<any>}
 **/
export function importRelative (bin, req) {
  return importDirect(bin, importPath(req));
}

/**
 * Do a mkdirp (no global support, native)
 *
 * @param {string} dir
 **/
export function mkdirpSync (dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Delete the ful path (no glob support)
 *
 * @param {string} dir
 **/
export function rimrafSync (dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
}

/**
 * Recursively reads a directory, making a list of the matched extensions
 *
 * @param {string} src
 * @param {string[]} extensions
 * @param {string[]} [files]
 **/
export function readdirSync (src, extensions, files = []) {
  if (!fs.statSync(src).isDirectory()) {
    exitFatal(`Source ${src} should be a directory`);
  }

  fs
    .readdirSync(src)
    .forEach((file) => {
      const srcPath = path.join(src, file);

      if (fs.statSync(srcPath).isDirectory()) {
        if (!PATHS_EXCL.includes(file)) {
          readdirSync(srcPath, extensions, files);
        }
      } else if (extensions.some((e) => file.endsWith(e))) {
        files.push(srcPath);
      }
    });

  return files;
}

/**
 * Prints the fatal error message and exit with a non-zero return code
 *
 * @param {string} message
 * @param {Error} [error]
 * @returns {never}
 **/
export function exitFatal (message, error) {
  console.error();
  console.error('FATAL:', message);

  if (error) {
    console.error();
    console.error(error);
  }

  console.error();
  process.exit(1);
}

/**
 * Checks for Node version with a fatal exit code
 */
export function exitFatalEngine () {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

  if (engineVersionCmp(process.version, pkg.engines?.node) === -1) {
    console.error(
      `${BLANK}\n   FATAL: At least Node version ${pkg.engines.node} is required for development.\n${BLANK}`
    );

    console.error(`
        Technical explanation: For a development environment all projects in
        the @polkadot famility uses node:test in their operation. Currently the
        minimum required version of Node is thus set at the first first version
        with operational support, hence this limitation. Additionally only LTS
        Node versions are supported.

        LTS Node versions are detailed on https://nodejs.dev/en/about/releases/

    `);

    process.exit(1);
  }
}

/**
 * Checks for yarn usage with a fatal exit code
 */
export function exitFatalYarn () {
  if (!process.env['npm_execpath']?.includes('yarn')) {
    console.error(
      `${BLANK}\n   FATAL: The use of yarn is required, install via npm is not supported.\n${BLANK}`
    );
    console.error(`
        Technical explanation: All the projects in the @polkadot' family use
        yarn workspaces, along with hoisting of dependencies. Currently only
        yarn supports package.json workspaces, hence the limitation.

        If yarn is not available, you can get it from https://yarnpkg.com/

    `);

    process.exit(1);
  }
}
