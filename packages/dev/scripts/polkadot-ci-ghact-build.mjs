#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import mkdirp from 'mkdirp';
import os from 'os';
import path from 'path';
import rimraf from 'rimraf';
import yargs from 'yargs';

import copySync from './copySync.mjs';
import { denoCreateDir } from './deno.mjs';
import execSync from './execSync.mjs';
import gitSetup from './gitSetup.mjs';

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

function npmGetVersion () {
  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
  ).version;
}

function npmGetJson () {
  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
  );
}

function npmAddVersionX () {
  const json = npmGetJson();

  if (!json.version.endsWith('-x')) {
    json.version = json.version + '-x';
    fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), JSON.stringify(json, null, 2));
  }
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
    .forEach((file) => copySync(file, 'build'));

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

function addChangelog (version, ...names) {
  const entry = `${names.join(', ')} ${version}`;
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
  const fullPath = `build/${bundName}`;

  if (!fs.existsSync(fullPath)) {
    return;
  } else if (!withBund && (version.includes('-') || (argv['skip-beta'] && !version.endsWith('.1')))) {
    return;
  }

  console.log(`\n *** bundle ${name}`);

  if (shouldBund.length === 0) {
    shouldBund.push(version);
  }

  shouldBund.push(dirName);

  rimraf.sync(`../../${bundClone}/${bundName}`);
  copySync(fullPath, `../../${bundClone}`);
}

function bundlePublish () {
  execSync(`git clone ${bundRepo} ${bundClone}`, true);

  loopFunc(bundlePublishPkg);

  commitClone(bundRepo, bundClone, shouldBund);
}

function denoPublishPkg () {
  const { name, version } = npmGetJson();

  if (fs.existsSync('.skip-deno') || !fs.existsSync('build-deno')) {
    return;
  } else if (!withDeno && (version.includes('-') || (argv['skip-beta'] && !version.endsWith('.1')))) {
    return;
  }

  console.log(`\n *** deno ${name}`);

  const dirName = denoCreateDir(name);
  const denoPath = `../../${denoClone}/${dirName}`;

  if (shouldDeno.length === 0) {
    shouldDeno.push(version);
  }

  shouldDeno.push(dirName);

  rimraf.sync(denoPath);
  mkdirp.sync(denoPath);

  copySync('build-deno/**/*', denoPath);
}

function denoPublish () {
  execSync(`git clone ${denoRepo} ${denoClone}`, true);

  loopFunc(denoPublishPkg);

  commitClone(denoRepo, denoClone, shouldDeno);
}

function gitBump () {
  const currentVersion = npmGetVersion();
  const [version, tag] = currentVersion.split('-');
  const [,, patch] = version.split('.');

  if (argv['skip-beta'] || patch === '0') {
    // don't allow beta versions
    execSync('yarn polkadot-dev-version patch');
    withNpm = true;
  } else {
    const triggerPath = path.join(process.cwd(), '.123trigger');
    const available = fs.readFileSync(triggerPath, 'utf-8').split('\n');

    if (tag || patch === '1' || available.includes(currentVersion)) {
      // if we don't want to publish, add an X before passing
      if (!withNpm) {
        npmAddVersionX();
      }

      // if we have a beta version, just continue the stream of betas
      execSync('yarn polkadot-dev-version pre');
      // we don't manually tweak withNpm, it is only based on the .123npm file
      // withNpm = true;
    } else {
      // manual setting of version
      fs.appendFileSync(triggerPath, `\n${currentVersion}`);
      withNpm = true;
    }
  }

  // always ensure we have made some changes, so we can commit
  fs.writeFileSync(path.join(process.cwd(), '.123current'), npmGetVersion());

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

  if (fs.existsSync('.123deno')) {
    rimraf.sync('.123deno');
    withDeno = true;
  }

  if (fs.existsSync('.123bundle')) {
    rimraf.sync('.123bundle');
    withBund = true;
  }

  if (fs.existsSync('.123npm')) {
    rimraf.sync('.123npm');
    withNpm = true;
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

gitSetup();
gitBump();
npmSetup();

runClean();
runCheck();
runTest();
runBuild();

gitPush();

denoPublish();
bundlePublish();

loopFunc(npmPublish);
