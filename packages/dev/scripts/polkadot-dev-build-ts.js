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
  execSync(`${path.join(__dirname, 'polkadot-exec-webpack.js')} --config webpack.config.js --mode production`, { stdio: 'inherit' });
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

    console.log(`*** ${name} ${version}`);

    mkdirp.sync('build');

    if (fs.existsSync(path.join(process.cwd(), 'public'))) {
      buildWebpack(dir);
    } else {
      await buildBabel(dir);
    }

    console.log();
  }
}

async function main () {
  execSync(path.join(__dirname, 'polkadot-dev-clean-build.js'), { stdio: 'inherit' });

  process.chdir('packages');

  execSync(`${path.join(__dirname, 'polkadot-exec-tsc.js')} --emitDeclarationOnly --outdir ../build`, { stdio: 'inherit' });

  const dirs = fs
    .readdirSync('.')
    .filter((dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src')));

  for (const dir of dirs) {
    process.chdir(dir);

    await buildJs(dir);

    process.chdir('..');
  }

  process.chdir('..');
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
