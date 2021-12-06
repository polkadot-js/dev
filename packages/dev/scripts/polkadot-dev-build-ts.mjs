#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import babel from '@babel/cli/lib/babel/dir.js';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

import { EXT_CJS, EXT_ESM } from '../config/babel-extensions.cjs';
import copySync from './copySync.mjs';
import { __dirname } from './dirname.mjs';
import execSync from './execSync.mjs';

const BL_CONFIGS = ['js', 'cjs'].map((e) => `babel.config.${e}`);
const WP_CONFIGS = ['js', 'cjs'].map((e) => `webpack.config.${e}`);
const RL_CONFIGS = ['js', 'mjs', 'cjs'].map((e) => `rollup.config.${e}`);
const CPX = ['patch', 'js', 'cjs', 'mjs', 'json', 'd.ts', 'css', 'gif', 'hbs', 'jpg', 'png', 'svg']
  .map((ext) => `src/**/*.${ext}`)
  .concat(['package.json', 'README.md']);

console.log('$ polkadot-dev-build-ts', process.argv.slice(2).join(' '));

const isTypeModule = EXT_ESM === '.js';
const EXT_OTHER = isTypeModule ? EXT_CJS : EXT_ESM;

// webpack build
function buildWebpack () {
  const config = WP_CONFIGS.find((c) => fs.existsSync(path.join(process.cwd(), c)));

  execSync(`yarn polkadot-exec-webpack --config ${config} --mode production`);
}

// compile via babel, either via supplied config or default
async function buildBabel (dir, type) {
  const configs = BL_CONFIGS.map((c) => path.join(process.cwd(), `../../${c}`));
  const outDir = path.join(process.cwd(), 'build');

  await babel.default({
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
      outFileExtension: type === 'esm' ? EXT_ESM : EXT_CJS
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
function createMapEntry (rootDir, jsPath) {
  jsPath = relativePath(jsPath);

  const otherPath = jsPath.replace('.js', EXT_OTHER);
  const otherReq = isTypeModule ? 'require' : 'import';
  const field = otherPath !== jsPath && fs.existsSync(path.join(rootDir, otherPath))
    ? {
      [otherReq]: otherPath,
      // eslint-disable-next-line sort-keys
      default: jsPath
    }
    : jsPath;

  if (jsPath.endsWith('.js')) {
    if (jsPath.endsWith('/index.js')) {
      return [jsPath.replace('/index.js', ''), field];
    } else {
      return [jsPath.replace('.js', ''), field];
    }
  }

  return [jsPath, field];
}

// find the names of all the files in a certain directory
function findFiles (buildDir, extra = '') {
  const currDir = extra ? path.join(buildDir, extra) : buildDir;

  return fs
    .readdirSync(currDir)
    .reduce((all, jsName) => {
      const jsPath = `${extra}/${jsName}`;
      const thisPath = path.join(buildDir, jsPath);
      const toDelete = jsName.includes('.spec.') || // no tests
        jsName.endsWith('.d.js') || // no .d.ts compiled outputs
        jsName.endsWith(`.d${EXT_OTHER}`) || // same as above, esm version
        (
          jsName.endsWith('.d.ts') && // .d.ts without .js as an output
          !fs.existsSync(path.join(buildDir, jsPath.replace('.d.ts', '.js')))
        );

      if (toDelete) {
        fs.unlinkSync(thisPath);
      } else if (fs.statSync(thisPath).isDirectory()) {
        findFiles(buildDir, jsPath).forEach((entry) => all.push(entry));
      } else if (!jsName.endsWith(EXT_OTHER) || !fs.existsSync(path.join(buildDir, jsPath.replace(EXT_OTHER, '.js')))) {
        // this is not mapped to a compiled .js file (where we have dual esm/cjs mappings)
        all.push(createMapEntry(buildDir, jsPath));
      }

      return all;
    }, []);
}

// iterate through all the files that have been built, creating an exports map
function buildExports () {
  const buildDir = path.join(process.cwd(), 'build');
  const pkgPath = path.join(buildDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const list = findFiles(buildDir);

  if (!list.some(([key]) => key === '.')) {
    // for the env-specifics, add a root key (if not available)
    list.push(['.', {
      browser: createMapEntry(buildDir, pkg.browser)[1],
      node: createMapEntry(buildDir, pkg.main)[1],
      'react-native': createMapEntry(buildDir, pkg['react-native'])[1]
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
    .reduce((all, [path, config]) => ({
      ...all,
      [path]: typeof config === 'string'
        ? config
        : {
          ...((pkg.exports && pkg.exports[path]) || {}),
          ...config
        }
    }), {});
  pkg.type = isTypeModule
    ? 'module'
    : 'commonjs';

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

function sortJson (json) {
  return Object
    .entries(json)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((all, [k, v]) => ({ ...all, [k]: v }), {});
}

function orderPackageJson (repoPath, dir, json) {
  json.bugs = `https://github.com/${repoPath}/issues`;
  json.homepage = `https://github.com/${repoPath}${dir ? `/tree/master/packages/${dir}` : ''}#readme`;
  json.license = json.license || 'Apache-2';
  json.repository = {
    ...(dir
      ? { directory: `packages/${dir}` }
      : {}
    ),
    type: 'git',
    url: `https://github.com/${repoPath}.git`
  };
  json.sideEffects = json.sideEffects || false;

  // sort the object
  const sorted = sortJson(json);

  // remove empty artifacts
  ['engines'].forEach((d) => {
    if (typeof json[d] === 'object' && Object.keys(json[d]).length === 0) {
      delete sorted[d];
    }
  });

  // move the different entry points to the (almost) end
  ['browser', 'electron', 'main', 'react-native'].forEach((d) => {
    delete sorted[d];

    if (json[d]) {
      sorted[d] = json[d];
    }
  });

  // move bin, scripts & dependencies to the end
  [
    ['bin', 'scripts'],
    ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies', 'resolutions']
  ].forEach((a) =>
    a.forEach((d) => {
      delete sorted[d];

      if (json[d] && Object.keys(json[d]).length) {
        sorted[d] = sortJson(json[d]);
      }
    })
  );

  fs.writeFileSync(path.join(process.cwd(), 'package.json'), `${JSON.stringify(sorted, null, 2)}\n`);
}

async function buildJs (repoPath, dir) {
  const json = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf-8'));
  const { name, version } = json;

  if (!json.name.startsWith('@polkadot/')) {
    return;
  }

  console.log(`*** ${name} ${version}`);

  orderPackageJson(repoPath, dir, json);

  if (!fs.existsSync(path.join(process.cwd(), '.skip-build'))) {
    mkdirp.sync('build');
    fs.writeFileSync(path.join(process.cwd(), 'src/packageInfo.ts'), `// Copyright 2017-2021 ${name} authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Auto-generated by @polkadot/dev, do not edit

export const packageInfo = { name: '${name}', version: '${version}' };
`);

    if (fs.existsSync(path.join(process.cwd(), 'public'))) {
      buildWebpack();
    } else {
      await buildBabel(dir, 'cjs');
      await buildBabel(dir, 'esm');

      buildExports();
    }

    console.log();
  }
}

function lintError (full, line, lineNumber, error) {
  throw new Error(`${full.split('/packages/')[1]}:: line ${lineNumber + 1}:: ${error}:: \n\n\t${line}\n`);
}

function lintOutput (dir) {
  fs
    .readdirSync(dir)
    .forEach((sub) => {
      const full = path.join(dir, sub);

      if (fs.statSync(full).isDirectory()) {
        lintOutput(full);
      } else if (full.endsWith('.d.ts') || full.endsWith('.js') || full.endsWith('.cjs')) {
        fs
          .readFileSync(full, 'utf-8')
          .split('\n')
          .forEach((l, n) => {
            if (l.includes('import') && l.includes('/src/')) {
              // we are not allowed to import from /src/
              lintError(full, l, n, 'Invalid import from /src/');
            // eslint-disable-next-line no-useless-escape
            } else if (l.includes(/\d/) && /[\+\-\*\/\=\<\>\|\&\%\^\(\)\{\}\[\] ][0-9]{1,}n/.test(l)) {
              // we don't want untamed BigInt literals
              lintError(full, l, n, 'Prefer BigInt(<digits>) to <dignits>n');
            }
          });
      }
    });
}

async function main () {
  execSync('yarn polkadot-dev-clean-build');

  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf-8'));

  if (pkg.scripts && pkg.scripts['build:extra']) {
    execSync('yarn build:extra');
  }

  const repoPath = pkg.repository.url
    .split('https://github.com/')[1]
    .split('.git')[0];

  orderPackageJson(repoPath, null, pkg);

  process.chdir('packages');

  execSync('yarn polkadot-exec-tsc --emitDeclarationOnly --outdir ../build');

  const dirs = fs
    .readdirSync('.')
    .filter((dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src')));

  for (const dir of dirs) {
    process.chdir(dir);

    await buildJs(repoPath, dir);

    process.chdir('..');
  }

  process.chdir('..');

  if (RL_CONFIGS.some((c) => fs.existsSync(path.join(process.cwd(), c)))) {
    execSync('yarn polkadot-exec-rollup --config');
  }

  for (const dir of dirs) {
    const buildPath = path.join(process.cwd(), 'packages', dir, 'build');

    if (fs.existsSync(buildPath)) {
      lintOutput(buildPath);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
