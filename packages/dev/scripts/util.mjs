// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { fileURLToPath } from 'url';

/** CJS/ESM compatible __filename */
export const __filename = fileURLToPath(import.meta.url);

/** CJS/ESM compatible __dirname */
export const __dirname = path.dirname(__filename);

/** Deno prefix for x/* */
export const DENO_INT_PRE = 'https://deno.land/x';

/** Deno prefix for externals */
export const DENO_EXT_PRE = 'https://esm.sh';

/** Deno prefix for built-ins */
export const DENO_LND_PRE = 'https://deno.land';

/** The GH user that we use for actions */
export const GITHUB_USER = 'github-actions[bot]';

/** The GH email for actions */
export const GITHUB_MAIL = '41898282+github-actions[bot]@users.noreply.github.com';

/** Paths that we generally building to */
export const PATHS_BUILD = ['', '-cjs', '-esm', '-deno', '-docs', '-swc', '-swc-cjs', '-swc-esm', '-wasm'];

/** Copy a file to a target dit */
export function copyFileSync (src, destDir) {
  if (Array.isArray(src)) {
    src.forEach((s) => copyFileSync(s, destDir));
  } else {
    fs.copyFileSync(src, path.join(destDir, path.basename(src)));
  }
}

/** Recursively copies a directory to a target dir */
export function copyDirSync (src, dest, extensions) {
  if (Array.isArray(src)) {
    src.forEach((s) => copyDirSync(s, dest, extensions));
  } else if (!fs.existsSync(src)) {
    // it doesn't exist, so we have nothing to copy
  } else if (!fs.statSync(src).isDirectory()) {
    throw new Error(`Source ${src} should be a directory`);
  } else {
    mkdirpSync(dest);

    fs
      .readdirSync(src)
      .forEach((file) => {
        const srcPath = path.join(src, file);

        if (fs.statSync(srcPath).isDirectory()) {
          copyDirSync(srcPath, path.join(dest, file), extensions);
        } else if (!extensions || extensions.some((e) => file.endsWith(e))) {
          copyFileSync(srcPath, dest);
        }
      });
  }
}

/** Creates a deno name on x/* */
export function denoCreateName (name) {
  return `${name.replace('@polkadot/', 'polkadot/')}`;
}

/** Creates a deno directory name */
export function denoCreateDir (name) {
  // aligns with name above - since we have sub-paths, we only return
  // the actual path inside packages/* (i.e. the last part of the name)
  return name.replace('@polkadot/', '');
}

/** Process execution */
export function execSync (cmd, noLog) {
  !noLog && console.log(`$ ${cmd}`);

  cp.execSync(cmd, { stdio: 'inherit' });
}

/** Node binary execution */
export function execNode (name, cmd) {
  const args = process.argv.slice(2).join(' ');

  console.log(`$ ${name}${args ? ` ${args}` : ''}`);

  return execSync(`${importPath(cmd)}${args ? ` ${args}` : ''}`, true);
}

/** A consistent setup for git variables */
export function gitSetup () {
  execSync(`git config user.name "${GITHUB_USER}"`);
  execSync(`git config user.email "${GITHUB_MAIL}"`);

  execSync('git config push.default simple');
  execSync('git config merge.ours.driver true');

  execSync('git checkout master');
}

/** Do an import from a <this module> path */
export function importPath (req) {
  return path.join(process.cwd(), 'node_modules', req);
}

/** Do an async import */
export async function importDirect (bin, req) {
  console.log(`$ ${bin} ${process.argv.slice(2).join(' ')}`);

  try {
    const mod = await import(req);

    return mod;
  } catch (error) {
    console.error(`Error importing ${req}`);
    console.error(error);
    process.exit(1);
  }
}

/** Do a relative async import */
export function importRelative (bin, req) {
  return importDirect(bin, importPath(req));
}

/** Do a mkdirp (no global support, native) */
export function mkdirpSync (dir) {
  fs.mkdirpSync(dir, { recursive: true });
}

/** Delete the ful path (no glob support) */
export function rimrafSync (dir) {
  rimraf.sync(dir);
}
