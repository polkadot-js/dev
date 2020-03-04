#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const { execSync } = require('child_process');
const cpx = require('cpx');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const argv = require('yargs')
  .options({
    'skip-beta': {
      description: 'Do not increment as beta',
      type: 'boolean'
    }
  })
  .strict()
  .argv;

const token = process.env.GH_PAT || `x-access-token:${process.env.GITHUB_TOKEN}`;
const repo = `https://${token}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
const hasLerna = fs.existsSync(path.join(process.cwd(), 'lerna.json'));

function runClean () {
  console.log('*** Running clean');

  execSync('yarn run polkadot-dev-clean-build', { stdio: 'inherit' });

  console.log('*** Checks completed');
}

function runCheck () {
  console.log('*** Running checks');

  execSync('yarn run lint', { stdio: 'inherit' });

  console.log('*** Checks completed');
}

function runTest () {
  console.log('*** Running tests');

  execSync('yarn run test', { stdio: 'inherit' });

  // if [ -f "coverage/lcov.info" ] && [ -n "$COVERALLS_REPO_TOKEN" ]; then
  //   console.log('*** Submitting to coveralls.io');

  //   (cat coverage/lcov.info | yarn run coveralls) || true
  // fi

  console.log('*** Tests completed');
}

function runBuild () {
  console.log('*** Running build');

  execSync('yarn run build', { stdio: 'inherit' });

  console.log('*** Build completed');
}

function lernaGetVersion () {
  const json = require(path.resolve(process.cwd(), 'lerna.json'));

  return json.version;
}

function lernaBump () {
  console.log('*** Incrementing lerna version');

  const [version, tag] = lernaGetVersion().split('-');
  const [,, patch] = version.split('.');
  const isBeta = tag.includes('beta.');

  if (isBeta) {
    // if we have a beta version, just continue the stream of betas
    execSync('yarn run polkadot-dev-version --type prerelease', { stdio: 'inherit' });
  } else if (argv['skip-beta']) {
    // don't allow beta versions
    execSync('yarn polkadot-dev-version --type patch', { stdio: 'inherit' });
  } else if (patch === '0') {
    // patch is .0, so publish this as an actual release (surely we did out job on beta)
    execSync('yarn polkadot-dev-version --type patch', { stdio: 'inherit' });
  } else if (patch === '1') {
    // continue with first new minor as beta
    execSync('yarn polkadot-dev-version --type preminor', { stdio: 'inherit' });
  } else {
    console.log('*** Not setting version, patch detected');
    // echo "$LERNA_VERSION" >> .123trigger
  }

  // we will have inter-package mismatches, resolve
  execSync('yarn install', { stdio: 'inherit' });
  execSync('git add --all .', { stdio: 'inherit' });

  console.log('*** Lerna increment completed');
}

function npmBump () {
  console.log('*** Incrementing npm version');

  execSync('npm --no-git-tag-version --force version patch', { stdio: 'inherit' });
  execSync('yarn install', { stdio: 'inherit' });
  execSync('git add --all .', { stdio: 'inherit' });

  console.log('*** Npm increment completed');
}

function npmGetVersion (noLerna) {
  if (!noLerna && hasLerna) {
    return lernaGetVersion();
  }

  const json = require(path.resolve(process.cwd(), 'lerna.json'));

  return json.version;
}

function npmSetup () {
  const registry = 'registry.npmjs.org';

  console.log(`*** Setting up npm for ${registry}`);

  fs.writeFileSync('~/.npmrc', `//${registry}/:_authToken=${process.env.NPM_TOKEN}`);

  console.log('*** Npm setup completed');
}

function npmPublish (package) {
  if (fs.existsSync(path.join(package, '.skip-npm'))) {
    return;
  }

  console.log('*** Copying package files to build');

  rimraf.sync('build/package.json');
  ['LICENSE', 'README.md', 'package.json'].forEach((file) => cpx.copySync(file, 'build'));

  console.log('*** Publishing to npm');

  const count = 1;
  const tag = npmGetVersion(true).includes('-beta.')
    ? '--tag beta'
    : '';

  process.chdir('build');

  while (true) {
    try {
      execSync(`npm publish --access public ${tag}`, { stdio: 'inherit' });

      break;
    } catch (error) {
      if (count < 5) {
        const end = Date.now() + 15000;

        console.log(`Publish failed on attempt $${count}/5. Retrying in 15s`);

        while (Date.now() < end) {
          // just spin our wheels
        }
      }
    }
  }

  process.chdir('..');

  console.log('*** Npm publish completed');
}

function gitSetup () {
  console.log('*** Setting up GitHub for $GITHUB_REPOSITORY');

  execSync('git config push.default simple', { stdio: 'inherit' });
  execSync('git config merge.ours.driver true', { stdio: 'inherit' });
  execSync('git config user.name "Github Actions"', { stdio: 'inherit' });
  execSync('git config user.email "action@github.com"', { stdio: 'inherit' });
  execSync('git checkout master', { stdio: 'inherit' });

  console.log('*** GitHub setup completed');
}

function gitBump () {
  if (hasLerna) {
    lernaBump();
  } else {
    npmBump();
  }
}

function gitPush () {
  console.log('*** Adding build artifacts');

  execSync('git add --all .', { stdio: 'inherit' });

  if (fs.existsSync('docs/README.md')) {
    execSync('git add --all -f docs', { stdio: 'inherit' });
  }

  console.log('*** Committing changed files');

  // add the skip checks for GitHub ...
  execSync(`git commit --no-status --quiet -m "[CI Skip] ${npmGetVersion()}


skip-checks: true"`, { stdio: 'inherit' });

  console.log('*** Pushing to GitHub');

  execSync(`git push ${repo} HEAD:${process.env.GITHUB_REF}`, { stdio: 'inherit' });

  console.log('*** Github push completed');
}

function loopFunc (fn) {
  if (hasLerna) {
    fs
      .readdirSync('packages')
      .filter((dir) =>
        fs.statSync(dir).isDirectory() &&
        fs.existsSync(path.join(dir, 'package.json')) &&
        fs.existsSync(path.join(dir, 'build'))
      )
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

console.log('*** CI build completed');
