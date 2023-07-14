#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import yargs from 'yargs';

import { copyDirSync, copyFileSync, denoCreateDir, execSync, exitFatal, GITHUB_REPO, GITHUB_TOKEN_URL, gitSetup, mkdirpSync, rimrafSync } from './util.mjs';

/** @typedef {Record<string, any>} ChangelogMap */

console.log('$ polkadot-ci-ghact-build', process.argv.slice(2).join(' '));

const DENO_REPO = 'polkadot-js/build-deno.land';
const BUND_REPO = 'polkadot-js/build-bundle';

const repo = `${GITHUB_TOKEN_URL}/${GITHUB_REPO}.git`;
const denoRepo = `${GITHUB_TOKEN_URL}/${DENO_REPO}.git`;
const bundRepo = `${GITHUB_TOKEN_URL}/${BUND_REPO}.git`;
const bundClone = 'build-bundle-clone';
const denoClone = 'build-deno-clone';

let withDeno = false;
let withBund = false;
let withNpm = false;

/** @type {string[]} */
const shouldDeno = [];
/** @type {string[]} */
const shouldBund = [];

const argv = await yargs(process.argv.slice(2))
  .options({
    'skip-beta': {
      description: 'Do not increment as beta',
      type: 'boolean'
    }
  })
  .strict()
  .argv;

/** Runs the clean command */
function runClean () {
  execSync('yarn polkadot-dev-clean-build');
}

/** Runs the lint command */
function runLint () {
  execSync('yarn lint');
}

/** Runs the test command */
function runTest () {
  execSync('yarn test');
}

/** Runs the build command */
function runBuild () {
  execSync('yarn build');
}

/**
 * Removes a specific file, returning true if found, false otherwise
 *
 * @param {string} file
 * @returns {boolean}
 */
function rmFile (file) {
  if (fs.existsSync(file)) {
    rimrafSync(file);

    return true;
  }

  return false;
}

/**
 * Retrieves the path of the root package.json
 *
 * @returns {string}
 */
function npmGetJsonPath () {
  return path.resolve(process.cwd(), 'package.json');
}

/**
 * Retrieves the contents of the root package.json
 *
 * @returns {{ name: string; version: string; versions?: { npm?: string; git?: string } }}
 */
function npmGetJson () {
  return JSON.parse(
    fs.readFileSync(npmGetJsonPath(), 'utf8')
  );
}

/**
 * Writes the contents of the root package.json
 *
 * @param {any} json
 */
function npmSetJson (json) {
  fs.writeFileSync(npmGetJsonPath(), `${JSON.stringify(json, null, 2)}\n`);
}

/**
 * Retrieved the current version included in package.json
 *
 * @returns {string}
 */
function npmGetVersion () {
  return npmGetJson().version;
}

/**
 * Sets the current to have an -x version specifier (aka beta)
 */
function npmAddVersionX () {
  const json = npmGetJson();

  if (!json.version.endsWith('-x')) {
    json.version = json.version + '-x';
    npmSetJson(json);
  }
}

/**
 * Removes the current -x version specifier (aka beta)
 */
function npmDelVersionX () {
  const json = npmGetJson();

  if (json.version.endsWith('-x')) {
    json.version = json.version.replace('-x', '');
    npmSetJson(json);
  }
}

/**
 * Sets the {versions: { npm, git } } fields in package.json
 */
function npmSetVersionFields () {
  const json = npmGetJson();

  if (!json.versions) {
    json.versions = {};
  }

  json.versions.git = json.version;

  if (!json.version.endsWith('-x')) {
    json.versions.npm = json.version;
  }

  npmSetJson(json);
  rmFile('.123current');
}

/**
 * Sets the npm token in the home directory
 */
function npmSetup () {
  const registry = 'registry.npmjs.org';

  fs.writeFileSync(path.join(os.homedir(), '.npmrc'), `//${registry}/:_authToken=${process.env['NPM_TOKEN']}`);
}

/**
 * Publishes the current package
 *
 * @returns {void}
 */
function npmPublish () {
  if (fs.existsSync('.skip-npm') || !withNpm) {
    return;
  }

  ['LICENSE', 'package.json']
    .filter((file) => !fs.existsSync(path.join(process.cwd(), 'build', file)))
    .forEach((file) => copyFileSync(file, 'build'));

  process.chdir('build');

  const tag = npmGetVersion().includes('-') ? '--tag beta' : '';
  let count = 1;

  while (true) {
    try {
      execSync(`npm publish --quiet --access public ${tag}`);

      break;
    } catch {
      if (count < 5) {
        const end = Date.now() + 15000;

        console.error(`Publish failed on attempt ${count}/5. Retrying in 15s`);
        count++;

        while (Date.now() < end) {
          // just spin our wheels
        }
      }
    }
  }

  process.chdir('..');
}

/**
 * Creates a map of changelog entries
 *
 * @param {string[][]} parts
 * @param {ChangelogMap} result
 * @returns {ChangelogMap}
 */
function createChangelogMap (parts, result = {}) {
  for (let i = 0, count = parts.length; i < count; i++) {
    const [n, ...e] = parts[i];

    if (!result[n]) {
      if (e.length) {
        result[n] = createChangelogMap([e]);
      } else {
        result[n] = { '': {} };
      }
    } else {
      if (e.length) {
        createChangelogMap([e], result[n]);
      } else {
        result[n][''] = {};
      }
    }
  }

  return result;
}

/**
 * Creates an array of changelog entries
 *
 * @param {ChangelogMap} map
 * @returns {string[]}
 */
function createChangelogArr (map) {
  const result = [];
  const entries = Object.entries(map);

  for (let i = 0, count = entries.length; i < count; i++) {
    const [name, imap] = entries[i];

    if (name) {
      if (imap['']) {
        result.push(name);
      }

      const inner = createChangelogArr(imap);

      if (inner.length === 1) {
        result.push(`${name}-${inner[0]}`);
      } else if (inner.length) {
        result.push(`${name}-{${inner.join(', ')}}`);
      }
    }
  }

  return result;
}

/**
 * Adds changelog entries
 *
 * @param {string[]} changelog
 * @returns {string}
 */
function addChangelog (changelog) {
  const [version, ...names] = changelog;
  const entry = `${
    createChangelogArr(
      createChangelogMap(
        names
          .sort()
          .map((n) => n.split('-'))
      )
    ).join(', ')
  } ${version}`;
  const newInfo = `## master\n\n- ${entry}\n`;

  if (!fs.existsSync('CHANGELOG.md')) {
    fs.writeFileSync('CHANGELOG.md', `# CHANGELOG\n\n${newInfo}`);
  } else {
    const md = fs.readFileSync('CHANGELOG.md', 'utf-8');

    fs.writeFileSync('CHANGELOG.md', md.includes('## master\n\n')
      ? md.replace('## master\n\n', newInfo)
      : md.replace('# CHANGELOG\n\n', `# CHANGELOG\n\n${newInfo}\n`)
    );
  }

  return entry;
}

/**
 *
 * @param {string} repo
 * @param {string} clone
 * @param {string[]} names
 */
function commitClone (repo, clone, names) {
  if (names.length) {
    process.chdir(clone);

    const entry = addChangelog(names);

    gitSetup();
    execSync('git add --all .');
    execSync(`git commit --no-status --quiet -m "${entry}"`);
    execSync(`git push ${repo}`, true);

    process.chdir('..');
  }
}

/**
 * Publishes a specific package to polkadot-js bundles
 *
 * @returns {void}
 */
function bundlePublishPkg () {
  const { name, version } = npmGetJson();
  const dirName = name.split('/')[1];
  const bundName = `bundle-polkadot-${dirName}.js`;
  const srcPath = path.join('build', bundName);
  const dstDir = path.join('../..', bundClone);

  if (!fs.existsSync(srcPath)) {
    return;
  }

  console.log(`\n *** bundle ${name}`);

  if (shouldBund.length === 0) {
    shouldBund.push(version);
  }

  shouldBund.push(dirName);

  rimrafSync(path.join(dstDir, bundName));
  copyFileSync(srcPath, dstDir);
}

/**
 * Publishes all packages to polkadot-js bundles
 *
 * @returns {void}
 */
function bundlePublish () {
  const { version } = npmGetJson();

  if (!withBund && version.includes('-')) {
    return;
  }

  execSync(`git clone ${bundRepo} ${bundClone}`, true);

  loopFunc(bundlePublishPkg);

  commitClone(bundRepo, bundClone, shouldBund);
}

/**
 * Publishes a specific package to Deno
 *
 * @returns {void}
 */
function denoPublishPkg () {
  const { name, version } = npmGetJson();

  if (fs.existsSync('.skip-deno') || !fs.existsSync('build-deno')) {
    return;
  }

  console.log(`\n *** deno ${name}`);

  const dirName = denoCreateDir(name);
  const denoPath = `../../${denoClone}/${dirName}`;

  if (shouldDeno.length === 0) {
    shouldDeno.push(version);
  }

  shouldDeno.push(dirName);

  rimrafSync(denoPath);
  mkdirpSync(denoPath);

  copyDirSync('build-deno', denoPath);
}

/**
 * Publishes all packages to Deno
 *
 * @returns {void}
 */
function denoPublish () {
  const { version } = npmGetJson();

  if (!withDeno && version.includes('-')) {
    return;
  }

  execSync(`git clone ${denoRepo} ${denoClone}`, true);

  loopFunc(denoPublishPkg);

  commitClone(denoRepo, denoClone, shouldDeno);
}

/**
 * Retrieves flags based on current specifications
 */
function getFlags () {
  withDeno = rmFile('.123deno');
  withBund = rmFile('.123bundle');
  withNpm = rmFile('.123npm');
}

/**
 * Bumps the current version, also applying to all sub-packages
 */
function verBump () {
  const { version: currentVersion, versions } = npmGetJson();
  const [version, tag] = currentVersion.split('-');
  const [,, patch] = version.split('.');
  const lastVersion = versions?.npm || currentVersion;

  if (argv['skip-beta'] || patch === '0') {
    // don't allow beta versions
    execSync('yarn polkadot-dev-version patch');
    withNpm = true;
  } else if (tag || currentVersion === lastVersion) {
    // if we don't want to publish, add an X before passing
    if (!withNpm) {
      npmAddVersionX();
    } else {
      npmDelVersionX();
    }

    // beta version, just continue the stream of betas
    execSync('yarn polkadot-dev-version pre');
  } else {
    // manually set, got for publish
    withNpm = true;
  }

  // always ensure we have made some changes, so we can commit
  npmSetVersionFields();
  rmFile('.123trigger');

  execSync('yarn polkadot-dev-contrib');
  execSync('git add --all .');
}

/**
 * Commits and pushes the current version on git
 */
function gitPush () {
  const version = npmGetVersion();
  let doGHRelease = false;

  if (process.env['GH_RELEASE_GITHUB_API_TOKEN']) {
    const changes = fs.readFileSync('CHANGELOG.md', 'utf8');

    if (changes.includes(`## ${version}`)) {
      doGHRelease = true;
    } else if (version.endsWith('.1')) {
      exitFatal(`Unable to release, no CHANGELOG entry for ${version}`);
    }
  }

  execSync('git add --all .');

  if (fs.existsSync('docs/README.md')) {
    execSync('git add --all -f docs');
  }

  // add the skip checks for GitHub ...
  execSync(`git commit --no-status --quiet -m "[CI Skip] ${version.includes('-x') ? 'bump' : 'release'}/${version.includes('-') ? 'beta' : 'stable'} ${version}


skip-checks: true"`);

  execSync(`git push ${repo} HEAD:${process.env['GITHUB_REF']}`, true);

  if (doGHRelease) {
    const files = process.env['GH_RELEASE_FILES']
      ? `--assets ${process.env['GH_RELEASE_FILES']}`
      : '';

    execSync(`yarn polkadot-exec-ghrelease --draft ${files} --yes`);
  }
}

/**
 * Loops through the packages/* (or root), executing the supplied
 * function for each package found
 *
 * @param {() => unknown} fn
 */
function loopFunc (fn) {
  if (fs.existsSync('packages')) {
    fs
      .readdirSync('packages')
      .filter((dir) => {
        const pkgDir = path.join(process.cwd(), 'packages', dir);

        return fs.statSync(pkgDir).isDirectory() &&
          fs.existsSync(path.join(pkgDir, 'package.json')) &&
          fs.existsSync(path.join(pkgDir, 'build'));
      })
      .forEach((dir) => {
        process.chdir(path.join('packages', dir));
        fn();
        process.chdir('../..');
      });
  } else {
    fn();
  }
}

// first do infrastructure setup
gitSetup();
npmSetup();

// get flags immediate, then adjust
getFlags();
verBump();

// perform the actual CI ops
runClean();
runLint();
runTest();
runBuild();

// publish to all GH repos
gitPush();
denoPublish();
bundlePublish();

// publish to npm
loopFunc(npmPublish);
