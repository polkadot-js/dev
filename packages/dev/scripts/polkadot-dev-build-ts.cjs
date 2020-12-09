#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const babel = require('@babel/cli/lib/babel/dir').default;
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const copySync = require('./copySync.cjs');
const execSync = require('./execSync.cjs');

const CONFIGS = ['babel.config.js', 'babel.config.cjs'];
const CPX = ['css', 'gif', 'hbs', 'jpg', 'js', 'json', 'png', 'svg', 'd.ts']
  .map((ext) => `src/**/*.${ext}`)
  .concat('package.json');

console.log('$ polkadot-dev-build-ts', process.argv.slice(2).join(' '));

// webpack build
function buildWebpack () {
  execSync('yarn polkadot-exec-webpack --config webpack.config.js --mode production');
}

// compile via babel, either via supplied config or default
async function buildBabel (dir, type) {
  const buildDir = `build${type === 'esm' ? '/esm' : ''}`;
  const configs = CONFIGS.map((c) => path.join(process.cwd(), `../../${c}`));
  const outDir = path.join(process.cwd(), buildDir);

  await babel({
    babelOptions: {
      configFile: type === 'esm'
        ? path.join(__dirname, '../config/babel-config-esm.cjs')
        : configs.find((f) => fs.existsSync(f)) || path.join(__dirname, '../config/babel-config-cjs.cjs')
    },
    cliOptions: {
      extensions: ['.ts', '.tsx'],
      filenames: ['src'],
      ignore: '**/*.d.ts',
      outDir,
      outFileExtension: '.js'
    }
  });

  [...CPX]
    .concat(`../../build/${dir}/src/**/*.d.ts`, `../../build/packages/${dir}/src/**/*.d.ts`)
    .forEach((src) => copySync(src, buildDir));

  // rewrite a skeleton package.json with a type=module
  if (type === 'esm') {
    const pkgPath = path.join(outDir, 'package.json');
    const pkg = require(pkgPath);
    const base = {};

    // overrides
    if (pkg.browser) base.browser = pkg.browser;
    if (pkg.main) base.main = pkg.main;
    if (pkg['react-native']) base['react-native'] = pkg['react-native'];

    fs.writeFileSync(pkgPath, JSON.stringify({
      ...base,
      author: pkg.author,
      license: pkg.license,
      name: pkg.name,
      repository: pkg.repository,
      sideEffects: pkg.sideEffects || false,
      type: 'module',
      version: pkg.version
    }, null, 2));
  }
}

// iterate through all the files that have been built, creating an exports map
function buildExports (dir) {
  // nothing atm
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
      await buildBabel(dir, 'cjs');
      await buildBabel(dir, 'esm');

      buildExports();
    }

    console.log();
  }
}

async function main () {
  execSync('yarn polkadot-dev-clean-build');

  process.chdir('packages');

  execSync('yarn polkadot-exec-tsc --emitDeclarationOnly --outdir ../build');

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
