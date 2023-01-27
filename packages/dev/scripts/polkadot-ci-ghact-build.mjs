#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import os from 'os';
import path from 'path';
import yargs from 'yargs';

import { copyDirSync, copyFileSync, denoCreateDir, execSync, gitSetup, mkdirpSync, rimrafSync } from './util.mjs';

console.log('$ polkadot-ci-ghact-build', process.argv.slice(2).join(' '));

const DENO_REPO = 'polkadot-js/build-deno.land';
const BUND_REPO = 'polkadot-js/build-bundle';

const repo = `https://${process.env.GH_PAT}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
const denoRepo = `https://${process.env.GH_PAT}@github.com/${DENO_REPO}.git`;
const bundRepo = `https://${process.env.GH_PAT}@github.com/${BUND_REPO}.git`;
const bundClone = 'build-bundle-clone';
const denoClone = 'build-deno-clone';

let withDeno = false;
let withBund = false;
let withNpm = false;
const shouldDeno = [];
const shouldBund = [];

const argv = yargs(process.argv.slice(2))
  .options({
    'skip-beta': {
      description: 'Do not increment as beta',
      type: 'boolean'
    }
  })
  .strict()
  .argv;

function runClean () {
  execSync('yarn polkadot-dev-clean-build');
}

function runCheck () {
  execSync('yarn lint');
}

function runTest () {
  execSync('yarn test');

  // if [ -f "coverage/lcov.info" ] && [ -n "$COVERALLS_REPO_TOKEN" ]; then
  //   console.log('*** Submitting to coveralls.io');

  //   (cat coverage/lcov.info | yarn run coveralls) || true
  // fi
}

function runBuild () {
  execSync('yarn build');
}

function rmFile (file) {
  if (fs.existsSync(file)) {
    rimrafSync(file);

    return true;
  }

  return false;
}

function npmGetJsonPath () {
  return path.resolve(process.cwd(), 'package.json');
}

function npmGetJson () {
  return JSON.parse(
    fs.readFileSync(npmGetJsonPath(), 'utf8')
  );
}

function npmSetJson (json) {
  fs.writeFileSync(npmGetJsonPath(), `${JSON.stringify(json, null, 2)}\n`);
}

function npmGetVersion () {
  return npmGetJson().version;
}

function npmAddVersionX () {
  const json = npmGetJson();

  if (!json.version.endsWith('-x')) {
    json.version = json.version + '-x';
    npmSetJson(json);
  }
}

function npmDelVersionX () {
  const json = npmGetJson();

  if (json.version.endsWith('-x')) {
    json.version = json.version.replace('-x', '');
    npmSetJson(json);
  }
}

function npmSetVersionFields () {
  const json = npmGetJson();

  if (!json.versions) {
    json.versions = {};
  }

  if (json.versionGit) {
    json.versions.git = json.versionGit;
    delete json.versionGit;
  }

  if (json.versionNpm) {
    json.versions.npm = json.versionNpm;
    delete json.versionNpm;
  }

  json.versions.git = json.version;

  if (!json.version.endsWith('-x')) {
    json.versions.npm = json.version;
  }

  npmSetJson(json);
  rmFile('.123current');
}

function npmSetup () {
  const registry = 'registry.npmjs.org';

  fs.writeFileSync(path.join(os.homedir(), '.npmrc'), `//${registry}/:_authToken=${process.env.NPM_TOKEN}`);
}

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
      execSync(`npm publish --access public ${tag}`);

      break;
    } catch (error) {
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

function createChangelogMap (parts, result = {}) {
  for (let i = 0; i < parts.length; i++) {
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

function createChangelogArr (map) {
  const result = [];
  const entries = Object.entries(map);

  for (let i = 0; i < entries.length; i++) {
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

function addChangelog (version, ...names) {
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

function commitClone (repo, clone, names) {
  if (names.length) {
    process.chdir(clone);

    const entry = addChangelog(...names);

    gitSetup();
    execSync('git add --all .');
    execSync(`git commit --no-status --quiet -m "${entry}"`);
    execSync(`git push ${repo}`, true);

    process.chdir('..');
  }
}

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

function bundlePublish () {
  const { version } = npmGetJson();

  if (!withBund && version.includes('-')) {
    return;
  }

  execSync(`git clone ${bundRepo} ${bundClone}`, true);

  loopFunc(bundlePublishPkg);

  commitClone(bundRepo, bundClone, shouldBund);
}

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

function denoPublish () {
  const { version } = npmGetJson();

  if (!withDeno && version.includes('-')) {
    return;
  }

  execSync(`git clone ${denoRepo} ${denoClone}`, true);

  loopFunc(denoPublishPkg);

  commitClone(denoRepo, denoClone, shouldDeno);
}

function getFlags () {
  withDeno = rmFile('.123deno');
  withBund = rmFile('.123bundle');
  withNpm = rmFile('.123npm');
}

function verBump () {
  const { version: currentVersion, versionNpm, versions } = npmGetJson();
  const [version, tag] = currentVersion.split('-');
  const [,, patch] = version.split('.');
  const lastVersion = versions
    ? versions.npm
    : versionNpm;

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

function gitPush () {
  const version = npmGetVersion();
  let doGHRelease = false;

  if (process.env.GH_RELEASE_GITHUB_API_TOKEN) {
    const changes = fs.readFileSync('CHANGELOG.md', 'utf8');

    if (changes.includes(`## ${version}`)) {
      doGHRelease = true;
    } else if (version.endsWith('.1')) {
      throw new Error(`Unable to release, no CHANGELOG entry for ${version}`);
    }
  }

  execSync('git add --all .');

  if (fs.existsSync('docs/README.md')) {
    execSync('git add --all -f docs');
  }

  // add the skip checks for GitHub ...
  execSync(`git commit --no-status --quiet -m "[CI Skip] ${version.includes('-x') ? 'bump' : 'release'}/${version.includes('-') ? 'beta' : 'stable'} ${version}


skip-checks: true"`);

  execSync(`git push ${repo} HEAD:${process.env.GITHUB_REF}`, true);

  if (doGHRelease) {
    const files = process.env.GH_RELEASE_FILES
      ? `--assets ${process.env.GH_RELEASE_FILES}`
      : '';

    execSync(`yarn polkadot-exec-ghrelease --draft ${files} --yes`);
  }
}

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
runCheck();
runTest();
runBuild();

// publish to all GH repos
gitPush();
denoPublish();
bundlePublish();

// publish to npm
loopFunc(npmPublish);
