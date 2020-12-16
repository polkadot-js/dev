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
const CPX = ['js', 'cjs', 'mjs', 'json', 'd.ts', 'css', 'gif', 'hbs', 'jpg', 'png', 'svg']
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

function relativePath (value) {
  return `${value.startsWith('.') ? value : './'}${value}`.replace(/\/\//g, '/');
}

// creates an entry for the cjs/esm name
function createMapEntry (withEsm, rootDir, cjsPath) {
  cjsPath = relativePath(cjsPath);

  const esmPath = cjsPath.replace('.js', '.mjs');
  const jsIsNode = fs.readFileSync(path.join(rootDir, cjsPath), 'utf8').includes('@polkadot/dev: exports-node');
  const field = withEsm && esmPath !== cjsPath && fs.existsSync(path.join(rootDir, esmPath))
    // ordering here is important: import, require, node/browser, default (last)
    ? jsIsNode
      // eslint-disable-next-line sort-keys
      ? { node: cjsPath, import: esmPath, default: cjsPath }
      // eslint-disable-next-line sort-keys
      : { import: esmPath, default: cjsPath }
    : cjsPath;

  if (cjsPath.endsWith('.js')) {
    if (cjsPath.endsWith('/index.js')) {
      return [cjsPath.replace('/index.js', ''), field];
    } else {
      return [cjsPath.replace('.js', ''), field];
    }
  }

  return [cjsPath, field];
}

// find the names of all the files in a certain directory
function findFiles (withEsm, buildDir, extra = '') {
  const currDir = extra ? path.join(buildDir, extra) : buildDir;

  return fs
    .readdirSync(currDir)
    .reduce((all, cjsName) => {
      const cjsPath = `${extra}/${cjsName}`;
      const thisPath = path.join(buildDir, cjsPath);
      const toDelete = cjsName.includes('.spec.') || // no tests
        cjsName.endsWith('.d.js') || // no .d.ts compiled outputs
        cjsName.endsWith('.d.mjs') || // same as above, esm version
        (
          cjsName.endsWith('.d.ts') && // .d.ts without .js as an output
          !fs.existsSync(path.join(buildDir, cjsPath.replace('.d.ts', '.js')))
        );

      if (toDelete) {
        fs.unlinkSync(thisPath);
      } else if (fs.statSync(thisPath).isDirectory()) {
        findFiles(withEsm, buildDir, cjsPath).forEach((entry) => all.push(entry));
      } else if (!cjsName.endsWith('.mjs')) {
        all.push(createMapEntry(withEsm, buildDir, cjsPath));
      }

      return all;
    }, []);
}

// iterate through all the files that have been built, creating an exports map
function buildExports (withEsm) {
  const buildDir = path.join(process.cwd(), 'build');
  const pkgPath = path.join(buildDir, 'package.json');
  const pkg = require(pkgPath);

  fs.writeFileSync(pkgPath.replace('package.json', 'package-info.json'), JSON.stringify({
    name: pkg.name,
    version: pkg.version
  }, null, 2));

  const list = findFiles(withEsm, buildDir);

  if (!list.some(([key]) => key === '.')) {
    // for the env-specifics, add a root key (if not available)
    list.push(['.', {
      browser: createMapEntry(withEsm, buildDir, pkg.browser)[1],
      node: createMapEntry(withEsm, buildDir, pkg.main)[1],
      'react-native': createMapEntry(withEsm, buildDir, pkg['react-native'])[1]
    }]);

    const indexDef = relativePath(pkg.main).replace('.js', '.d.ts');
    const indexKey = './index.d.ts';

    // additionally, add an index key, if not available
    if (!list.some(([key]) => key === indexKey)) {
      list.push([indexKey, indexDef]);
    }
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
      const withEsm = !fs.existsSync(path.join(process.cwd(), '.skip-esm'));

      await buildBabel(dir, 'cjs');

      if (withEsm) {
        await buildBabel(dir, 'esm');
      }

      buildExports(withEsm);
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
