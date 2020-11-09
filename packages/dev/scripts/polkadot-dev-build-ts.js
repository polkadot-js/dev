#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const babel = require('@babel/cli/lib/babel/dir').default;
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const copySync = require('./copySync');
const execSync = require('./execSync');

const CPX = ['css', 'gif', 'hbs', 'jpg', 'js', 'png', 'svg', 'd.ts']
  .map((ext) => `src/**/*.${ext}`)
  .concat('package.json');

console.log('$ polkadot-dev-build-ts', process.argv.slice(2).join(' '));

function buildWebpack () {
  execSync('yarn polkadot-exec-webpack --config webpack.config.js --mode production');
}

async function buildBabelConfig (isModules) {
  await babel({
    babelOptions: {
      configFile: path.join(process.cwd(), `../../babel.${isModules ? 'esnext' : 'config'}.js`)
    },
    cliOptions: {
      extensions: ['.ts', '.tsx'],
      filenames: ['src'],
      ignore: '**/*.d.ts',
      outDir: path.join(process.cwd(), isModules ? 'build/esnext' : 'build')
    }
  });
}

async function buildBabel (dir, withModules) {
  await buildBabelConfig(false);

  if (withModules) {
    await buildBabelConfig(true);
  }

  [...CPX]
    .concat(`../../build/${dir}/src/**/*.d.ts`, `../../build/packages/${dir}/src/**/*.d.ts`)
    .forEach((src) => copySync(src, 'build'));
}

async function buildJs (dir, withModules) {
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
      await buildBabel(dir, withModules);
    }

    console.log();
  }
}

async function main () {
  execSync('yarn polkadot-dev-clean-build');

  const withModules = fs.existsSync('babel.esnext.js');

  process.chdir('packages');

  execSync('yarn polkadot-exec-tsc --emitDeclarationOnly --outdir ../build');

  const dirs = fs
    .readdirSync('.')
    .filter((dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src')));

  for (const dir of dirs) {
    process.chdir(dir);

    await buildJs(dir, withModules);

    process.chdir('..');
  }

  process.chdir('..');
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
