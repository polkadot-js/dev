#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-var-requires */

const babel = require('@babel/cli/lib/babel/dir').default;
const { execSync } = require('child_process');
const cpx = require('cpx');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const CPX = ['package.json', 'src/**/*.css', 'src/**/*.gif', 'src/**/*.jpg', 'src/**/*.png', 'src/**/*.svg', 'src/**/*.d.ts', 'src/**/*.js'];

function buildWebpack () {
  execSync(`${path.join(__dirname, 'plokadot-dev-run-webpack.js')} --config webpack.config.js --mode production`);
}

async function buildBabel (dir) {
  await babel({
    babelOptions: {
      configFile: path.join(process.cwd(), '../../babel.config.js')
    },
    cliOptions: {
      extensions: ['.ts', '.tsx'],
      filenames: ['src'],
      ignore: '**/*.d.ts',
      outDir: path.join(process.cwd(), 'build')
    }
  });

  [...CPX]
    .concat(`../../build/${dir}/src/**/*.d.ts`, `../../build/packages/${dir}/src/**/*.d.ts`)
    .forEach((src) => cpx.copySync(src, 'build'));
}

async function buildJs (dir) {
  if (!fs.existsSync(path.join(process.cwd(), '.skip-build'))) {
    const { name, version } = require(path.join(process.cwd(), './package.json'));

    if (!name.startsWith('@polkadot/')) {
      return;
    }

    console.log(`${name} ${version}`);

    mkdirp.sync('build');

    if (fs.existsSync(path.join(process.cwd(), 'public'))) {
      buildWebpack(dir);
    } else {
      await buildBabel(dir);
    }
  }
}

function main () {
  execSync(path.join(__dirname, 'polkadot-dev-clean-build.js'));

  process.chdir('packages');

  execSync(`${path.join(__dirname, 'polkadot-dev-run-tsc.js')} --emitDeclarationOnly --outdir ../build`);

  Promise
    .all(
      fs
        .readdirSync('.')
        .filter((dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src')))
        .map((dir) => Promise
          .resolve(process.chdir(dir))
          .then(() => buildJs(dir))
          .finally(() => process.chdir('..'))
        )
    )
    .catch(console.error)
    .finally(() => process.chdir('..'));
}

main();
