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

async function buildBabelConfig (dir, isModules) {
  const [babelConfig, outBase, copySrc] = isModules
    ? ['babel.esnext.js', 'build/esnext', ['package.json']]
    : ['babel.config.js', 'build', [...CPX]];

  await babel({
    babelOptions: {
      configFile: path.join(process.cwd(), `../../${babelConfig}`)
    },
    cliOptions: {
      extensions: ['.ts', '.tsx'],
      filenames: ['src'],
      ignore: '**/*.d.ts',
      outDir: path.join(process.cwd(), outBase)
    }
  });

  copySrc
    .concat(`../../build/${dir}/src/**/*.d.ts`, `../../build/packages/${dir}/src/**/*.d.ts`)
    .forEach((src) => copySync(src, outBase));
}

async function buildBabel (dir, withModules) {
  await buildBabelConfig(dir, false);

  if (withModules) {
    await buildBabelConfig(dir, true);
  }
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

  const withModules = fs.existsSync(path.join(process.cwd(), 'babel.esnext.js'));

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
