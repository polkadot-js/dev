// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import url from 'node:url';

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

/** Paths that we generally building to (catch-all for possible usages) */
export const PATHS_BUILD = ['', '-cjs', '-esm'].reduce((r, a) => r.concat(['', '-babel', '-esbuild', '-swc'].map((b) => `${b}${a}`)), ['-deno', '-docs', '-wasm']).sort();

/** Paths that are generally excluded from source operations */
export const PATHS_EXCL = ['node_modules', ...PATHS_BUILD.map((e) => `build${e}`)];

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
    exitFatal(`Source ${src} should be a directory`);
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

/** Creates a deno directory name */
export function denoCreateDir (name) {
  // aligns with name above - since we have sub-paths, we only return
  // the actual path inside packages/* (i.e. the last part of the name)
  return name.replace('@polkadot/', '');
}

/** Process execution */
export function execSync (cmd, noLog) {
  !noLog && console.log(`$ ${cmd.replaceAll('  ', ' ')}`);

  cp.execSync(cmd, { stdio: 'inherit' });
}

/** Node execution with ts support */
export function execNodeTsSync (cmd, noLog) {
  execSync(`${process.execPath} --no-warnings --enable-source-maps --loader @polkadot/dev/node/ts ${cmd}`, noLog);
}

/** Node binary execution */
export function execViaNode (name, cmd) {
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
  fs.mkdirSync(dir, { recursive: true });
}

/** Delete the ful path (no glob support) */
export function rimrafSync (dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
}

/** Recursively reads a directory, making a list of the matched extensions */
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

/** Prints the fatal error message and exit with a non-zero return code */
export function exitFatal (message) {
  console.error();
  console.error('FATAL:', message);
  console.error();
  process.exit(1);
}
