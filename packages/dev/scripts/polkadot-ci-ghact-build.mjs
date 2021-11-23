#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import os from 'os';
import path from 'path';
import yargs from 'yargs';

import copySync from './copySync.mjs';
import execSync from './execSync.mjs';

console.log('$ polkadot-ci-ghact-build', process.argv.slice(2).join(' '));

const repo = `https://${process.env.GH_PAT}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

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

function npmSetup () {
  const registry = 'registry.npmjs.org';

  fs.writeFileSync(path.join(os.homedir(), '.npmrc'), `//${registry}/:_authToken=${process.env.NPM_TOKEN}`);
}

function npmPublish () {
  if (fs.existsSync('.skip-npm')) {
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

function gitSetup () {
  execSync('git config push.default simple');
  execSync('git config merge.ours.driver true');
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config user.email "action@github.com"');
  execSync('git checkout master');
}

// function createContributors () {
//   const child = spawnSync('git', ['--no-pager', 'shortlog', '--summary', '--numbered', '--email'], {
//     encoding: 'utf-8',
//     stdio: ['inherit', 'pipe', 'pipe']
//   });

//   const contributors = child.stdout
//     .split('\n')
//     .filter((l) =>
//       l.includes('\t') &&
//       !(
//         l.startsWith('Travis CI') ||
//         l.startsWith('GitHub') ||
//         l.includes('<>') ||
//         l.includes('<action@github.com>') ||
//         l.includes('[bot]')
//       )
//     )
//     .map((l) => l.split('\t'))
//     .map(([count, author]) => {
//       const [name, email] = author.split(' <');

//       return [parseInt(count.trim()), name, `<${email}`];
//     })
//     .reduce((all, [count, name, email]) => {
//       const first = all.find(([, n, e]) => {
//         if (e === email) {
//           return true;
//         } else if (n === name) {
//           const [userA, providerA] = email.split('@');
//           const [userB, providerB] = email.split('@');

//           return userA === userB || providerA === providerB;
//         }

//         return false;
//       });

//       if (first) {
//         first[0] += count;
//       } else {
//         all.push([count, name, email]);
//       }

//       return all;
//     }, [])
//     .sort((a, b) => b[0] - a[0])
//     .map(([count, name, email]) => `${count.toString().padStart(8)}    ${name} ${email}`)
//     .join('\n');

//   fs.writeFileSync('CONTRIBUTORS', `${contributors}\n`);
// }

function gitBump () {
  const currentVersion = npmGetVersion();
  const [version, tag] = currentVersion.split('-');
  const [,, patch] = version.split('.');

  if (argv['skip-beta'] || patch === '0') {
    // don't allow beta versions
    execSync('yarn polkadot-dev-version patch');
  } else {
    const triggerPath = path.join(process.cwd(), '.123trigger');
    const available = fs.readFileSync(triggerPath, 'utf-8').split('\n');

    if (tag || patch === '1' || available.includes(currentVersion)) {
      // if we have a beta version, just continue the stream of betas
      execSync('yarn polkadot-dev-version pre');
    } else {
      // manual setting of version, make some changes so we can commit
      fs.appendFileSync(triggerPath, `\n${currentVersion}`);
    }
  }

  // createContributors();

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
  execSync(`git commit --no-status --quiet -m "[CI Skip] release/${version.includes('-') ? 'beta' : 'stable'} ${version}


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
loopFunc(npmPublish);
