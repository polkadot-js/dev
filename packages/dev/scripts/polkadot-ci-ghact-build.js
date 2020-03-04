#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const execSync = require('./execSync');
const cpx = require('cpx');
const os = require('os');
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

console.log('$ polkadot-ci-ghact-build', process.argv.slice(2).join(' '));

function runClean () {
  console.log('*** Running clean');

  execSync('yarn polkadot-dev-clean-build');

  console.log('*** Checks completed');
}

function runCheck () {
  console.log('*** Running checks');

  execSync('yarn lint');

  console.log('*** Checks completed');
}

function runTest () {
  console.log('*** Running tests');

  execSync('yarn test');

  // if [ -f "coverage/lcov.info" ] && [ -n "$COVERALLS_REPO_TOKEN" ]; then
  //   console.log('*** Submitting to coveralls.io');

  //   (cat coverage/lcov.info | yarn run coveralls) || true
  // fi

  console.log('*** Tests completed');
}

function runBuild () {
  console.log('*** Running build');

  execSync('yarn build');

  console.log('*** Build completed');
}

function lernaGetVersion () {
  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'lerna.json'), 'utf8')
  ).version;
}

function lernaBump () {
  console.log('*** Incrementing lerna version');

  const [version, tag] = lernaGetVersion().split('-');
  const [,, patch] = version.split('.');
  const isBeta = !!tag && tag.includes('beta.');

  if (isBeta) {
    // if we have a beta version, just continue the stream of betas
    execSync('yarn run polkadot-dev-version --type prerelease');
  } else if (argv['skip-beta']) {
    // don't allow beta versions
    execSync('yarn polkadot-dev-version --type patch');
  } else if (patch === '0') {
    // patch is .0, so publish this as an actual release (surely we did out job on beta)
    execSync('yarn polkadot-dev-version --type patch');
  } else if (patch === '1') {
    // continue with first new minor as beta
    execSync('yarn polkadot-dev-version --type preminor');
  } else {
    console.log('*** Not setting version, patch detected');
    // echo "$LERNA_VERSION" >> .123trigger
  }

  // we will have inter-package mismatches, resolve
  execSync('yarn install');
  execSync('git add --all .');

  console.log('*** Lerna increment completed');
}

function npmBump () {
  console.log('*** Incrementing npm version');

  execSync('npm --no-git-tag-version --force version patch');
  execSync('yarn install');
  execSync('git add --all .');

  console.log('*** Npm increment completed');
}

function npmGetVersion (noLerna) {
  if (!noLerna && hasLerna) {
    return lernaGetVersion();
  }

  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
  ).version;
}

function npmSetup () {
  const registry = 'registry.npmjs.org';

  console.log(`*** Setting up npm for ${registry}`);

  fs.writeFileSync(path.join(os.homedir(), '.npmrc'), `//${registry}/:_authToken=${process.env.NPM_TOKEN}`);

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

  let count = 1;

  process.chdir('build');

  while (true) {
    try {
      execSync(`npm publish --access public${npmGetVersion(true).includes('-beta.') ? ' --tag beta' : ''}`);

      break;
    } catch (error) {
      if (count < 5) {
        const end = Date.now() + 15000;

        console.log(`Publish failed on attempt $${count}/5. Retrying in 15s`);
        count++;

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
  console.log(`*** Setting up GitHub for ${process.env.GITHUB_REPOSITORY}`);

  execSync('git config push.default simple');
  execSync('git config merge.ours.driver true');
  execSync('git config user.name "Github Actions"');
  execSync('git config user.email "action@github.com"');
  execSync('git checkout master');

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

  execSync('git add --all .');

  if (fs.existsSync('docs/README.md')) {
    execSync('git add --all -f docs');
  }

  console.log('*** Committing changed files');

  // add the skip checks for GitHub ...
  execSync(`git commit --no-status --quiet -m "[CI Skip] ${npmGetVersion()}


skip-checks: true"`);

  console.log('*** Pushing to GitHub');

  execSync(`git push ${repo} HEAD:${process.env.GITHUB_REF}`, true);

  console.log('*** Github push completed');
}

function loopFunc (fn) {
  if (hasLerna) {
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

console.log('*** CI build completed');
