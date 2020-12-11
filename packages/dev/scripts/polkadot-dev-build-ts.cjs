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
  const configs = CONFIGS.map((c) => path.join(process.cwd(), `../../${c}`));
  const outDir = path.join(process.cwd(), 'build');

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
      outFileExtension: type === 'esm' ? '.mjs' : '.js'
    }
  });

  // rewrite a skeleton package.json with a type=module
  if (type !== 'esm') {
    [...CPX]
      .concat(`../../build/${dir}/src/**/*.d.ts`, `../../build/packages/${dir}/src/**/*.d.ts`)
      .forEach((src) => copySync(src, 'build'));
  }
}

// find the names of all the files in a certain directory
function findFiles (withEsm, buildDir, extra = '') {
  const currDir = extra ? path.join(buildDir, extra) : buildDir;

  return fs
    .readdirSync(currDir)
    .reduce((all, cjsName) => {
      const cjsPath = `${extra}/${cjsName}`;
      const thisPath = path.join(buildDir, cjsPath);

      if (cjsName.includes('.spec.')) {
        fs.unlinkSync(thisPath);
      } else if (fs.statSync(thisPath).isDirectory()) {
        findFiles(withEsm, buildDir, cjsPath).forEach((entry) => all.push(entry));
      } else if (!cjsName.endsWith('.mjs') && !cjsName.endsWith('.d.js')) {
        const esmName = cjsName.replace('.js', '.mjs');
        const field = withEsm && esmName !== cjsName && fs.existsSync(path.join(currDir, esmName))
          // ordering here is important: import, require, node/browser, default (last)
          // eslint-disable-next-line sort-keys
          ? { import: `.${extra}/${esmName}`, default: `.${cjsPath}` }
          : `.${cjsPath}`;

        if (cjsName.endsWith('.js')) {
          if (cjsName === 'index.js') {
            all.push([`.${extra}`, field]);
          } else {
            all.push([`.${cjsPath.replace('.js', '')}`, field]);
          }
        } else {
          all.push([`.${cjsPath}`, field]);
        }
      }

      return all;
    }, []);
}

// iterate through all the files that have been built, creating an exports map
function buildExports () {
  const buildDir = path.join(process.cwd(), 'build');
  const pkgPath = path.join(buildDir, 'package.json');
  const pkg = require(pkgPath);
  const list = findFiles(false, buildDir);
  const migrateDot = (value) => `${value.startsWith('./') ? '' : './'}${value}`;

  if (!list.some(([key]) => key === '.')) {
    list.push(['.', {
      browser: migrateDot(pkg.browser),
      node: migrateDot(pkg.main),
      'react-native': migrateDot(pkg['react-native'])
    }]);
  }

  pkg.exports = list
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((all, [path, config]) => ({ ...all, [path]: config }), {});

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
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

      buildExports(dir);
    }

    console.log();
  }
}

async function main () {
  execSync('yarn polkadot-dev-clean-build');

  const pkg = require(path.join(process.cwd(), 'package.json'));

  if (pkg.scripts && pkg.scripts['build:extra']) {
    execSync('yarn build:extra');
  }

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
