#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import babel from '@babel/cli/lib/babel/dir.js';
import fs from 'fs';
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
const IGNORE_IMPORTS = [
  // node
  'crypto', 'fs', 'path', 'process', 'readline', 'util',
  // other
  'react', 'react-native'
];

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
    [
      ...CPX,
      `../../build/${dir}/src/**/*.d.ts`,
      `../../build/packages/${dir}/src/**/*.d.ts`
    ].forEach((s) => copySync(s, 'build'));
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
        jsName.includes('.manual.') || // no manual checks
        jsName.endsWith('.d.js') || // no .d.ts compiled outputs
        jsName.endsWith(`.d${EXT_OTHER}`) || // same as above, esm version
        (
          jsName.endsWith('.d.ts') && // .d.ts without .js as an output
          !fs.existsSync(path.join(buildDir, jsPath.replace('.d.ts', '.js')))
        ) ||
        thisPath.includes('/test/');

      if (fs.statSync(thisPath).isDirectory()) {
        findFiles(buildDir, jsPath).forEach((entry) => all.push(entry));
      } else if (toDelete) {
        fs.unlinkSync(thisPath);
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
    return null;
  }

  console.log(`*** ${name} ${version}`);

  orderPackageJson(repoPath, dir, json);

  if (!fs.existsSync(path.join(process.cwd(), '.skip-build'))) {
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
  }

  console.log();

  return name;
}

function createError (full, line, lineNumber, error) {
  return `${full.split('/packages/')[1]}:: ${lineNumber >= 0 ? `line ${lineNumber + 1}:: ` : ''}${error}:: \n\n\t${line}\n`;
}

function throwOnErrors (errors) {
  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

function loopFiles (exts, dir, fn) {
  return fs
    .readdirSync(dir)
    .reduce((errors, sub) => {
      const full = path.join(dir, sub);

      if (fs.statSync(full).isDirectory()) {
        return errors.concat(loopFiles(exts, full, fn));
      } else if (exts.some((e) => full.endsWith(e))) {
        return errors.concat(
          fs
            .readFileSync(full, 'utf-8')
            .split('\n')
            .map((l, n) => {
              const t = l
                // no leading/trailing whitespace
                .trim()
                // anything starting with * (multi-line comments)
                .replace(/^\*.*/, '')
                // anything between /* ... */
                .replace(/\/\*.*\*\//g, '')
                // single line comments with // ...
                .replace(/\/\/.*/, '');

              return fn(full, t, n);
            })
            .filter((e) => !!e)
        );
      }

      return errors;
    }, []);
}

function loopJsLines (dir, fn) {
  return loopFiles(['.d.ts', '.js', '.cjs'], dir, fn);
}

function lintOutput (dir) {
  throwOnErrors(
    loopJsLines(dir, (full, l, n) => {
      if (l.startsWith('import ') && l.includes(" from '") && l.includes('/src/')) {
        // we are not allowed to import from /src/
        return createError(full, l, n, 'Invalid import from /src/');
      // eslint-disable-next-line no-useless-escape
      } else if (/[\+\-\*\/\=\<\>\|\&\%\^\(\)\{\}\[\] ][0-9]{1,}n/.test(l)) {
        // we don't want untamed BigInt literals
        return createError(full, l, n, 'Prefer BigInt(<digits>) to <dignits>n');
      }

      return null;
    })
  );
}

function lintDependencies (dir, locals) {
  const { dependencies, name, private: isPrivate, optionalDependencies = {}, peerDependencies = {} } = JSON.parse(fs.readFileSync(path.join(dir, '../package.json'), 'utf-8'));

  if (isPrivate) {
    return;
  }

  const deps = [
    ...Object.keys(dependencies),
    ...Object.keys(peerDependencies),
    ...Object.keys(optionalDependencies)
  ];
  const references = JSON
    .parse(fs.readFileSync(path.join(dir, '../tsconfig.json'), 'utf-8'))
    .references
    .map(({ path }) => path.replace('../', ''));
  const refsFound = [];

  throwOnErrors(
    loopJsLines(dir, (full, l, n) => {
      if (l.startsWith("import '") || (l.startsWith('import ') && l.includes(" from '"))) {
        const dep = l
          .split(
            l.includes(" from '")
              ? " from '"
              : " '"
          )[1]
          .split("'")[0]
          .split('/')
          .slice(0, 2)
          .join('/');

        if (name !== dep && !dep.startsWith('.') && !IGNORE_IMPORTS.includes(dep)) {
          const local = locals.find(([, name]) => name === dep);

          if (!deps.includes(dep)) {
            return createError(full, l, n, `${dep} is not included in package.json dependencies`);
          } else if (local) {
            const ref = local[0];

            if (!references.includes(ref)) {
              return createError(full, l, n, `../${ref} not included in tsconfig.json references`);
            }

            if (!refsFound.includes(ref)) {
              refsFound.push(ref);
            }
          }
        }

        return null;
      }
    })
  );

  const extraRefs = references.filter((r) => !refsFound.includes(r));

  if (extraRefs.length) {
    throwOnErrors([
      createError(`${dir.replace('build/', '')}/tsconfig.json`, extraRefs.join(', '), -1, 'Unused tsconfig.json references found')
    ]);
  }
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
  execSync('yarn polkadot-exec-tsc --build');

  process.chdir('packages');

  const dirs = fs
    .readdirSync('.')
    .filter((dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src')));
  const locals = [];

  for (const dir of dirs) {
    process.chdir(dir);

    const name = await buildJs(repoPath, dir);

    if (name) {
      locals.push([dir, name]);
    }

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
      lintDependencies(buildPath, locals);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
