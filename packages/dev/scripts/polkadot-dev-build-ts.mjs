#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import JSON5 from 'json5';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

import { copyDirSync, copyFileSync, DENO_EXT_PRE, DENO_LND_PRE, DENO_POL_PRE, engineVersionCmp, execSync, exitFatal, exitFatalEngine, mkdirpSync, PATHS_BUILD, readdirSync, rimrafSync } from './util.mjs';

/** @typedef {'babel' | 'esbuild' | 'swc' | 'tsc'} CompileType */
/** @typedef {{ bin?: Record<string, string>; browser?: string; bugs?: string; deno?: string; denoDependencies?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string>; electron?: string; engines?: { node?: string }; exports?: Record<string, unknown>; license?: string; homepage?: string; main?: string; module?: string; name?: string; optionalDependencies?: Record<string, string>; peerDependencies?: Record<string, string>; repository?: { directory?: string; type: 'git'; url: string; }; 'react-native'?: string; resolutions?: Record<string, string>; sideEffects?: boolean | string[]; scripts?: Record<string, string>; type?: 'module' | 'commonjs'; types?: string; version?: string; }} PkgJson */

const WP_CONFIGS = ['js', 'cjs'].map((e) => `webpack.config.${e}`);
const RL_CONFIGS = ['js', 'mjs', 'cjs'].map((e) => `rollup.config.${e}`);

console.log('$ polkadot-dev-build-ts', process.argv.slice(2).join(' '));

exitFatalEngine();

// We need at least es2020 for dynamic imports. Aligns with dev-ts/loader & config/tsconfig
// Node 14 === es2020, Node 16 === es2021, Node 18 === es2022
// https://github.com/tsconfig/bases/blob/d699759e29cfd5f6ab0fab9f3365c7767fca9787/bases/node16.json#L8
const TARGET_TSES = ts.ScriptTarget.ES2021;
const TARGET_NODE = '>=16';

const IGNORE_IMPORTS = [
  // node (new-style)
  ...['assert', 'child_process', 'crypto', 'fs', 'module', 'os', 'path', 'process', 'readline', 'test', 'url', 'util'].map((m) => `node:${m}`),
  // other
  '@testing-library/react',
  'react', 'react-native', 'styled-components'
];

/**
 * webpack build
 */
function buildWebpack () {
  const config = WP_CONFIGS.find((c) => fs.existsSync(path.join(process.cwd(), c)));

  execSync(`yarn polkadot-exec-webpack --config ${config} --mode production`);
}

/**
 * compile via tsc, either via supplied config or default
 *
 * @param {CompileType} compileType
 * @param {'cjs' | 'esm'} type
 */
async function compileJs (compileType, type) {
  const buildDir = path.join(process.cwd(), `build-${compileType}-${type}`);

  mkdirpSync(buildDir);

  const files = readdirSync('src', ['.ts', '.tsx']).filter((f) =>
    !['.d.ts', '.manual.ts', '.spec.ts', '.spec.tsx', '.test.ts', '.test.tsx', 'mod.ts'].some((e) =>
      f.endsWith(e)
    )
  );

  if (compileType === 'tsc') {
    await timeIt(`Successfully compiled ${compileType} ${type}`, () => {
      files.forEach((filename) => {
        // split src prefix, replace .ts extension with .js
        const outFile = path.join(buildDir, filename.split(/[\\/]/).slice(1).join('/').replace(/\.tsx?$/, '.js'));

        // Until we hit the es2022 target, all private fields are compiled to using
        // WeakMap with less than stellar performannce of get/set on the polyfill. We
        // replace usages of these with TS-only private fields.
        //
        // As used these are internal-only, completely hidden fields should be done via
        // closures, see e.g. the common keypairs where this is done
        const source = fs
          .readFileSync(filename, 'utf-8')
          .replace(/(this|other|source)\.#/g, '$1.__internal__')
          .replace(/ {2}(async|readonly) #/g, '  private $1 __internal__')
          .replace(/ {2}#/g, '  private __internal__');

        // compile with the options aligning with our tsconfig
        const { outputText } = ts.transpileModule(source, {
          compilerOptions: {
            esModuleInterop: true,
            importHelpers: true,
            jsx: filename.endsWith('.tsx')
              ? ts.JsxEmit.ReactJSX
              : undefined,
            module: type === 'cjs'
              ? ts.ModuleKind.CommonJS
              : ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.NodeNext,
            target: TARGET_TSES
          }
        });

        mkdirpSync(path.dirname(outFile));
        fs.writeFileSync(outFile, outputText);
      });
    });
  } else {
    throw new Error(`Unknown --compiler ${compileType}`);
  }
}

/**
 * Writes a package.json file
 *
 * @param {string} path
 * @param {PkgJson} json
 */
function witeJson (path, json) {
  fs.writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
}

/**
 * Adjust all imports to have .js extensions
 *
 * @param {string} _pkgCwd
 * @param {PkgJson} _pkgJson
 * @param {string} dir
 * @param {string} f
 * @param {boolean} [_isDeclare]
 * @returns {string | null}
 */
function adjustJsPath (_pkgCwd, _pkgJson, dir, f, _isDeclare) {
  if (f.startsWith('.')) {
    if (f.endsWith('.js') || f.endsWith('.json')) {
      // ignore, these are already fully-specified
      return null;
    }

    const dirPath = path.join(process.cwd(), dir, f);
    const jsFile = `${f}.js`;
    const jsPath = path.join(process.cwd(), dir, jsFile);

    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      // this is a directory, append index.js
      return `${f}/index.js`;
    } else if (fs.existsSync(jsPath)) {
      // local source file
      return jsFile;
    }
  }

  // do not adjust
  return null;
}

/**
 * Adjust all @polkadot imports to have .ts extensions (for Deno)
 *
 * @param {string} pkgCwd
 * @param {PkgJson} pkgJson
 * @param {string} dir
 * @param {string} f
 * @param {boolean} [isDeclare]
 * @returns {string | null}
 */
function adjustDenoPath (pkgCwd, pkgJson, dir, f, isDeclare) {
  if (f.startsWith('@polkadot')) {
    const parts = f.split('/');
    const thisPkg = parts.slice(0, 2).join('/');
    const subPath = parts.slice(2).join('/');
    const pjsPath = `${DENO_POL_PRE}/${thisPkg.replace('@polkadot/', '')}`;

    if (subPath.includes("' assert { type:")) {
      // these are for type asserts, we keep the assert
      return `${pjsPath}/${subPath}`;
    } else if (parts.length === 2) {
      // if we only have 2 parts, we add deno/mod.ts
      return `${pjsPath}/mod.ts`;
    }

    // first we check in packages/* to see if we have this one
    const pkgPath = path.join(pkgCwd, '..', parts[1]);

    if (fs.existsSync(pkgPath)) {
      // aha, this is a package in the same repo, search src
      const checkPath = path.join(pkgPath, 'src', subPath);

      if (fs.existsSync(checkPath)) {
        if (fs.statSync(checkPath).isDirectory()) {
          // this is a directory, append index.ts
          return `${pjsPath}/${subPath}/index.ts`;
        }

        // as-is, the path exists
        return `${DENO_POL_PRE}/${subPath}`;
      } else if (!fs.existsSync(`${checkPath}.ts`)) {
        exitFatal(`Unable to find ${checkPath}.ts`);
      }

      return `${pjsPath}/${subPath}.ts`;
    }

    // now we check node_modules
    const nodePath = path.join(pkgCwd, '../../node_modules', thisPkg);

    if (fs.existsSync(nodePath)) {
      // aha, this is a package in the same repo
      const checkPath = path.join(nodePath, subPath);

      if (fs.existsSync(checkPath)) {
        if (fs.statSync(checkPath).isDirectory()) {
          // this is a directory, append index.ts
          return `${pjsPath}/${subPath}/index.ts`;
        }

        // as-is, it exists
        return `${pjsPath}/${subPath}`;
      } else if (!fs.existsSync(`${checkPath}.js`)) {
        exitFatal(`Unable to find ${checkPath}.js`);
      }

      return `${pjsPath}/${subPath}.ts`;
    }

    // we don't know what to do here :(
    exitFatal(`Unable to find ${f}`);
  } else if (f.startsWith('.')) {
    if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.json')) {
      // ignore, these are already fully-specified
      return null;
    } else if (f.endsWith('.js')) {
      if (f.includes('./cjs/')) {
        // import from cjs/, change it to deno
        return f.replace('/cjs/', '/deno/');
      }

      const tsFile = f.replace('.js', '.ts');
      const tsxFile = f.replace('.js', '.tsx');

      if (fs.existsSync(path.join(process.cwd(), dir, tsFile))) {
        // we have a .ts file for this one, rename
        return tsFile;
      } else if (fs.existsSync(path.join(process.cwd(), dir, tsxFile))) {
        // we have a .tsx file for this one, rename
        return tsxFile;
      }

      // leave the other paths as-is
      return null;
    }

    const dirPath = path.join(process.cwd(), dir, f);
    const tsFile = `${f}.ts`;
    const tsxFile = `${f}.tsx`;
    const tsPath = path.join(process.cwd(), dir, tsFile);
    const tsxPath = path.join(process.cwd(), dir, tsxFile);

    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      // this is a directory, append index.ts
      return fs.existsSync(path.join(dirPath, 'index.tsx'))
        ? `${f}/index.tsx`
        : `${f}/index.ts`;
    } else if (fs.existsSync(tsPath)) {
      // local source file
      return tsFile;
    } else if (fs.existsSync(tsxPath)) {
      // local source file
      return tsxFile;
    }

    // fully-specified file, keep it as-is (linting picks up invalids)
    return null;
  } else if (f.startsWith('node:')) {
    // Since Deno 1.28 the node: specifiers is supported out-of-the-box
    // so we just return and use these as-is
    return f;
  }

  const depParts = f.split('/');
  const depNameLen = f.startsWith('@')
    ? 2
    : 1;
  const depName = depParts.slice(0, depNameLen).join('/');
  let depPath = depParts.length > depNameLen
    ? '/' + depParts.slice(depNameLen).join('/')
    : null;

  const depVersion = pkgJson.dependencies?.[depName] && pkgJson.dependencies[depName] !== '*'
    ? pkgJson.dependencies[depName]
    : pkgJson.peerDependencies?.[depName]
      ? pkgJson.peerDependencies[depName]
      : pkgJson.optionalDependencies?.[depName]
        ? pkgJson.optionalDependencies[depName]
        : pkgJson.devDependencies
          ? pkgJson.devDependencies[depName]
          : null;
  let version = null;

  if (depVersion) {
    version = depVersion.replace('^', '').replace('~', '');
  } else if (isDeclare) {
    return f;
  }

  let [denoDep, ...denoPath] = pkgJson.denoDependencies?.[depName]
    ? pkgJson.denoDependencies[depName].split('/')
    : [null];

  if (!denoDep) {
    if (IGNORE_IMPORTS.includes(depName)) {
      // ignore, we handle this below
    } else if (depVersion) {
      // Here we use the npm: specifier (available since Deno 1.28)
      //
      // FIXME We cannot enable this until there is support for git deps
      // https://github.com/denoland/deno/issues/18557
      // This is used by @zondax/ledger-substrate
      // return `npm:${depName}@${depVersion}${depPath || ''}`;
    } else {
      exitFatal(`Unknown Deno versioned package '${f}' inside ${pkgJson.name}`);
    }
  } else if (denoDep === 'x') {
    denoDep = `x/${denoPath[0]}`;
    denoPath = denoPath.slice(1);

    if (!denoDep.includes('@')) {
      denoDep = `${denoDep}@${version}`;
    } else if (denoDep.includes('{{VERSION}}')) {
      if (!version) {
        throw new Error(`Unable to extract version for deno.land/${denoDep}`);
      }

      denoDep = denoDep.replace('{{VERSION}}', version);
    }
  }

  // Add JS specifier if required
  if (depPath) {
    depPath += '.js';
  }

  return denoDep
    ? `${DENO_LND_PRE}/${denoDep}${depPath || `/${denoPath.length ? denoPath.join('/') : 'mod.ts'}`}`
    : `${DENO_EXT_PRE}/${depName}${version ? `@${version}` : ''}${depPath || ''}`;
}

/**
 * @param {string} dir
 * @param {string} pkgCwd
 * @param {PkgJson} pkgJson
 * @param {(pkgCwd: string, pkgJson: PkgJson, f: string, dir: string, isDeclare?: boolean) => string | null} replacer
 * @returns {void}
 */
function rewriteImports (dir, pkgCwd, pkgJson, replacer) {
  if (!fs.existsSync(dir)) {
    return;
  }

  fs
    .readdirSync(dir)
    .forEach((p) => {
      const thisPath = path.join(process.cwd(), dir, p);

      if (fs.statSync(thisPath).isDirectory()) {
        rewriteImports(`${dir}/${p}`, pkgCwd, pkgJson, replacer);
      } else if (thisPath.endsWith('.spec.js') || thisPath.endsWith('.spec.ts')) {
        // we leave specs as-is
      } else if (thisPath.endsWith('.js') || thisPath.endsWith('.ts') || thisPath.endsWith('.tsx') || thisPath.endsWith('.md')) {
        fs.writeFileSync(
          thisPath,
          fs
            .readFileSync(thisPath, 'utf8')
            .split('\n')
            .filter((line) => !line.startsWith('//'))
            .map((line) =>
              line
                // handle import/export
                .replace(/(import|export) (.*) from '(.*)'/g, (o, t, a, f) => {
                  const adjusted = replacer(pkgCwd, pkgJson, dir, f);

                  return adjusted
                    ? `${t} ${a} from '${adjusted}'`
                    : o;
                })
                // handle augmented inputs
                .replace(/(import|declare module) '(.*)'/g, (o, t, f) => {
                  const adjusted = replacer(pkgCwd, pkgJson, dir, f, t !== 'import');

                  return adjusted
                    ? `${t} '${adjusted}'`
                    : o;
                })
                // handle dynamic imports
                .replace(/( import|^import)\('(.*)'\)/g, (o, t, f) => {
                  const adjusted = replacer(pkgCwd, pkgJson, dir, f);

                  return adjusted
                    ? `${t}('${adjusted}')`
                    : o;
                })
            )
            .join('\n')
        );
      }
    });
}

function buildDeno () {
  const pkgCwd = process.cwd();

  if (!fs.existsSync(path.join(pkgCwd, 'src/mod.ts'))) {
    return;
  }

  // copy the sources as-is
  copyDirSync('src', 'build-deno', [], ['.spec.ts', '.spec.tsx', '.test.ts', '.test.tsx']);
  copyFileSync('README.md', 'build-deno');

  // remove unneeded directories
  rimrafSync('build-deno/cjs');
}

/**
 * @param {string} [value]
 * @returns {string}
 */
function relativePath (value) {
  return `${value && value.startsWith('.') ? value : './'}${value}`.replace(/\/\//g, '/');
}

/**
 * creates an entry for the cjs/esm name
 *
 * @param {string} rootDir
 * @param {string} [jsPath]
 * @param {boolean} [noTypes]
 * @returns {[string, Record<string, unknown> | string]}
 */
function createMapEntry (rootDir, jsPath = '', noTypes) {
  jsPath = relativePath(jsPath);

  const cjsPath = jsPath.replace('./', './cjs/');
  const hasCjs = fs.existsSync(path.join(rootDir, cjsPath));
  const typesPath = jsPath.replace('.js', '.d.ts');
  const hasTypes = !noTypes && jsPath.endsWith('.js') && fs.existsSync(path.join(rootDir, typesPath));
  const field = hasCjs
    ? {
      // As per TS, the types key needs to be first
      ...(
        hasTypes
          ? { types: typesPath }
          : {}
      ),
      // bundler-specific path, eg. webpack & rollup
      ...(
        jsPath.endsWith('.js')
          ? { module: jsPath }
          : {}
      ),
      require: cjsPath,
      // eslint-disable-next-line sort-keys
      default: jsPath
    }
    : hasTypes
      ? {
        types: typesPath,
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

/**
 * copies all output files into the build directory
 *
 * @param {CompileType} compileType
 * @param {string} dir
 */
function copyBuildFiles (compileType, dir) {
  mkdirpSync('build/cjs');

  // copy package info stuff
  copyFileSync(['package.json', 'README.md'], 'build');
  copyFileSync('../../LICENSE', 'build');

  // copy interesting files
  copyDirSync('src', 'build', ['.patch', '.js', '.cjs', '.mjs', '.json', '.d.ts', '.d.cts', '.d.mts', '.css', '.gif', '.hbs', '.md', '.jpg', '.png', '.rs', '.svg']);

  // copy all *.d.ts files
  copyDirSync([path.join('../../build', dir, 'src'), path.join('../../build/packages', dir, 'src')], 'build', ['.d.ts']);

  // copy all from build-{babel|swc|tsc|...}-esm to build
  copyDirSync(`build-${compileType}-esm`, 'build');

  // copy from build-{babel|swc|tsc|...}-cjs to build/cjs (js-only)
  copyDirSync(`build-${compileType}-cjs`, 'build/cjs', ['.js']);
}

/**
 * remove all extra files that were generated as part of the build
 *
 * @param {string} [extra]
 * @param {string[][]} [invalids]
 */
function deleteBuildFiles (extra = '', invalids) {
  const isTopLevel = !invalids;

  invalids ??= [];

  const buildDir = 'build';
  const currDir = extra
    ? path.join('build', extra)
    : buildDir;
  const allFiles = fs
    .readdirSync(currDir)
    .map((jsName) => {
      const jsPath = `${extra}/${jsName}`;
      const fullPathEsm = path.join(buildDir, jsPath);

      return [jsName, jsPath, fullPathEsm];
    });

  // We want the build config tweaked to not allow these, so error-out
  // when they are found (it indicates a config failure)
  invalids.push(...allFiles.filter(([jsName, jsPath]) =>
    // no tests
    (
      ['.manual.', '.spec.', '.test.'].some((t) => jsName.includes(t)) &&
      // we explicitly exclude test paths, just treat as artifacts
      !jsPath.includes('/test/')
    ) ||
    // no deno mod.ts compiles
    ['mod.js', 'mod.d.ts', 'mod.ts'].some((e) => jsName === e)
  ));

  allFiles.forEach(([jsName, jsPath, fullPathEsm]) => {
    const toDelete = (
      // no test paths
      jsPath.includes('/test/') ||
      // no rust files
      ['.rs'].some((e) => jsName.endsWith(e)) ||
      // no tests
      ['.manual.', '.spec.', '.test.'].some((t) => jsName.includes(t)) ||
      // no .d.ts compiled outputs
      ['.d.js', '.d.cjs', '.d.mjs'].some((e) => jsName.endsWith(e)) ||
      // no deno mod.ts compiles
      ['mod.js', 'mod.d.ts', 'mod.ts'].some((e) => jsName === e) ||
      (
        // .d.ts without .js as an output
        jsName.endsWith('.d.ts') &&
        !['.js', '.cjs', '.mjs'].some((e) =>
          fs.existsSync(path.join(buildDir, jsPath.replace('.d.ts', e)))
        )
      )
    );

    if (fs.statSync(fullPathEsm).isDirectory()) {
      deleteBuildFiles(jsPath, invalids);

      PATHS_BUILD.forEach((b) => {
        // remove all empty directories
        const otherPath = path.join(`${buildDir}${b}`, jsPath);

        if (fs.existsSync(otherPath) && fs.readdirSync(otherPath).length === 0) {
          rimrafSync(otherPath);
        }
      });
    } else if (toDelete) {
      PATHS_BUILD.forEach((b) => {
        // check in the other build outputs and remove
        // (for deno we also want the spec copies)
        const otherPath = path.join(`${buildDir}${b}`, jsPath);
        const otherTs = otherPath.replace(/.spec.js$/, '.spec.ts');

        [otherPath, otherTs].forEach((f) => rimrafSync(f));
      });
    }
  }, []);

  if (isTopLevel && invalids.length) {
    throw new Error(`Invalid build outputs found in ${process.cwd()}: ${invalids.map(([,, p]) => p).join(', ')} (These should be excluded via a noEmit option in the project config)`);
  }
}

/**
 * find the names of all the files in a certain directory
 *
 * @param {string} buildDir
 * @param {string} [extra]
 * @param {string[]} [exclude]
 * @returns {[string, Record<String, unknown> | string][]}
 */
function findFiles (buildDir, extra = '', exclude = []) {
  const currDir = extra
    ? path.join(buildDir, extra)
    : buildDir;

  return fs
    .readdirSync(currDir)
    .filter((f) => !exclude.includes(f))
    .reduce((/** @type {[string, Record<String, unknown> | string][]} */ all, jsName) => {
      const jsPath = `${extra}/${jsName}`;
      const fullPathEsm = path.join(buildDir, jsPath);

      if (fs.statSync(fullPathEsm).isDirectory()) {
        findFiles(buildDir, jsPath).forEach((e) => all.push(e));
      } else {
        // this is not mapped to a compiled .js file (where we have dual esm/cjs mappings)
        all.push(createMapEntry(buildDir, jsPath));
      }

      return all;
    }, []);
}

/**
 * Tweak any CJS imports to import from the actual cjs path
 */
function tweakCjsPaths () {
  readdirSync('build/cjs', ['.js']).forEach((thisPath) => {
    fs.writeFileSync(
      thisPath,
      fs
        .readFileSync(thisPath, 'utf8')
        // This is actually problematic - while we don't use non-js imports (mostly),
        // this would also match those, which creates issues. For the most part we only
        // actually should only care about packageInfo, so add this one explicitly. If we
        // do use path-imports for others, rather adjust them at that specific point
        // .replace(
        //   /require\("@polkadot\/([a-z-]*)\/(.*)"\)/g,
        //   'require("@polkadot/$1/cjs/$2")'
        // )
        .replace(
          /require\("@polkadot\/([a-z-]*)\/packageInfo"\)/g,
          'require("@polkadot/$1/cjs/packageInfo")'
        )
    );
  });
}

/**
 * Adjusts the packageInfo.js files for the target output
 *
 * @param {CompileType} compileType
 */
function tweakPackageInfo (compileType) {
  // Hack around some bundler issues, in this case Vite which has import.meta.url
  // as undefined in production contexts (and subsequently makes URL fail)
  // See https://github.com/vitejs/vite/issues/5558
  const esmPathname = 'new URL(import.meta.url).pathname';
  const esmDirname = `(import.meta && import.meta.url) ? ${esmPathname}.substring(0, ${esmPathname}.lastIndexOf('/') + 1) : 'auto'`;
  const cjsDirname = "typeof __dirname === 'string' ? __dirname : 'auto'";

  ['esm', 'cjs'].forEach((jsType) => {
    const infoFile = `build-${compileType}-${jsType}/packageInfo.js`;

    fs.writeFileSync(
      infoFile,
      fs
        .readFileSync(infoFile, 'utf8')
        .replace(
          "type: 'auto'",
          `type: '${jsType}'`
        )
        .replace(
          "path: 'auto'",
          `path: ${jsType === 'cjs' ? cjsDirname : esmDirname}`
        )
    );
  });

  const denoFile = path.join('build-deno', 'packageInfo.ts');

  // Not all packages are built for deno (if no mod.ts, don't build)
  if (fs.existsSync(denoFile)) {
    fs.writeFileSync(
      denoFile,
      fs
        .readFileSync(denoFile, 'utf8')
        .replace(
          "type: 'auto'",
          "type: 'deno'"
        )
        .replace(
          "path: 'auto'",
          `path: ${esmPathname}`
        )
    );
  }
}

/**
 * Adjusts the order of fiels in the package.json
 *
 * @param {Record<string, unknown>} pkgJson
 * @param {string[]} fields
 */
function moveFields (pkgJson, fields) {
  fields.forEach((k) => {
    if (typeof pkgJson[k] !== 'undefined') {
      const value = pkgJson[k];

      delete pkgJson[k];

      pkgJson[k] = value;
    }
  });
}

/**
 * iterate through all the files that have been built, creating an exports map
 */
function buildExports () {
  const buildDir = path.join(process.cwd(), 'build');

  witeJson(path.join(buildDir, 'cjs/package.json'), { type: 'commonjs' });
  tweakCjsPaths();

  const pkgPath = path.join(buildDir, 'package.json');

  /** @type {PkgJson} */
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const listRoot = findFiles(buildDir, '', ['cjs', 'README.md', 'LICENSE']);

  if (!listRoot.some(([key]) => key === '.')) {
    const indexDef = relativePath(pkg.main).replace('.js', '.d.ts');

    // for the env-specifics, add a root key (if not available)
    listRoot.push(['.', {
      types: indexDef,
      // eslint-disable-next-line sort-keys
      'react-native': createMapEntry(buildDir, pkg['react-native'], true)[1],
      // eslint-disable-next-line sort-keys
      browser: createMapEntry(buildDir, pkg.browser, true)[1],
      node: createMapEntry(buildDir, pkg.main, true)[1]
    }]);
  }

  // cleanup extraneous fields
  delete pkg.devDependencies;

  if (!pkg.main && fs.existsSync(path.join(buildDir, 'index.d.ts'))) {
    pkg.main = 'index.js';
  }

  if (pkg.main) {
    const main = pkg.main.startsWith('./')
      ? pkg.main
      : `./${pkg.main}`;

    pkg.main = main.replace(/^\.\//, './cjs/');
    pkg.module = main;
    pkg.types = main.replace('.js', '.d.ts');
  }

  // Ensure the top-level entries always points to the CJS version
  (/** @type {const} */ (['browser', 'react-native'])).forEach((k) => {
    const value = pkg[k];

    if (typeof value === 'string') {
      const entry = value.startsWith('./')
        ? value
        : `./${value}`;

      pkg[k] = entry.replace(/^\.\//, './cjs/');
    }
  });

  if (Array.isArray(pkg.sideEffects)) {
    pkg.sideEffects = pkg.sideEffects.map((s) =>
      s.endsWith('.cjs')
        ? s.replace(/^\.\//, './cjs/').replace('.cjs', '.js')
        : s
    );
  }

  pkg.type = 'module';

  pkg.exports = listRoot
    .filter(([path, config]) =>
      // we handle the CJS path at the root below
      path !== './cjs/package.json' &&
      // we don't export ./deno/* paths (e.g. wasm)
      !path.startsWith('./deno/') &&
      // others
      (
        typeof config === 'object' ||
        !listRoot.some(([, c]) =>
          typeof c === 'object' &&
          Object.values(c).some((v) => v === path)
        )
      )
    )
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((all, [path, config]) => {
      const entry = typeof config === 'string'
        ? config
        // We need to force the types entry to the top,
        // so we merge, sort and re-assemble
        : Object
          .entries({
            ...(pkg.exports?.[path] ?? {}),
            ...config
          })
          .sort(([a], [b]) =>
            // types (first), module (first-ish), default (last)
            a === 'types'
              ? -1
              : b === 'types'
                ? 1
                : a === 'module'
                  ? -1
                  : b === 'module'
                    ? 1
                    : a === 'default'
                      ? 1
                      : b === 'default'
                        ? -1
                        : 0
          )
          .reduce((all, [key, value]) => ({
            ...all,
            [key]: value
          }), {});

      const pathParts = path.split(/[\\/]/);

      return {
        ...all,
        ...(
          path === '.'
            // eslint-disable-next-line sort-keys
            ? { './cjs/package.json': './cjs/package.json', './cjs/*': './cjs/*.js' }
            : ['./packageInfo', './shim'].includes(path)
              ? { [`${path}.js`]: entry }
              : {}
        ),
        [path]: entry,
        ...(
          path.endsWith('.mjs') || path.endsWith('.cjs')
            ? { [path.replace(/\.[cm]js$/, '')]: entry }
            : {}
        ),
        ...(
          ['index.cjs', 'index.mjs'].includes(pathParts[pathParts.length - 1])
            ? { [pathParts.slice(0, -1).join('/')]: entry }
            : {}
        )
      };
    }, {});

  moveFields(pkg, ['main', 'module', 'browser', 'deno', 'react-native', 'types', 'exports', 'dependencies', 'optionalDependencies', 'peerDependencies', 'denoDependencies']);
  witeJson(pkgPath, pkg);
}

/**
 * Sorts a JSON file (typically package.json) by key
 *
 * @param {Record<string, unknown>} json
 * @returns {Record<string, unknown>}
 */
function sortJson (json) {
  return Object
    .entries(json)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((all, [k, v]) => ({ ...all, [k]: v }), {});
}

/**
 * @internal
 *
 * Adjusts the engine setting, highest of current and requested
 *
 * @param {string} [currVer]
 * @returns {string}
 */
function getEnginesVer (currVer) {
  return currVer && engineVersionCmp(currVer, TARGET_NODE) === 1
    ? currVer
    : TARGET_NODE;
}

/**
 * @param {string} repoPath
 * @param {string | null} dir
 * @param {PkgJson} json
 */
function orderPackageJson (repoPath, dir, json) {
  json.bugs = `https://github.com/${repoPath}/issues`;
  json.homepage = `https://github.com/${repoPath}${dir ? `/tree/master/packages/${dir}` : ''}#readme`;
  json.license = !json.license || json.license === 'Apache-2'
    ? 'Apache-2.0'
    : json.license;
  json.repository = {
    ...(dir
      ? { directory: `packages/${dir}` }
      : {}
    ),
    type: 'git',
    url: `https://github.com/${repoPath}.git`
  };
  json.sideEffects = json.sideEffects || false;
  json.engines = {
    node: getEnginesVer(json.engines?.node)
  };

  // sort the object
  const sorted = sortJson(json);

  // remove fields we don't want to publish (may be re-added at some point)
  ['contributors', 'engine-strict', 'maintainers'].forEach((d) => {
    delete sorted[d];
  });

  // move the different entry points to the (almost) end
  (/** @type {const} */ (['browser', 'deno', 'electron', 'main', 'module', 'react-native'])).forEach((d) => {
    delete sorted[d];

    if (json[d]) {
      sorted[d] = json[d];
    }
  });

  // move bin, scripts & dependencies to the end
  (/** @type {const} */ (['bin', 'scripts', 'exports', 'dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies', 'denoDependencies', 'resolutions'])).forEach((d) => {
    delete sorted[d];

    const value = json[d];

    if (value && Object.keys(value).length) {
      sorted[d] = sortJson(value);
    }
  });

  witeJson(path.join(process.cwd(), 'package.json'), sorted);
}

/**
 * @param {string} full
 * @param {string} line
 * @param {number} lineNumber
 * @param {string} error
 * @returns {string}
 */
function createError (full, line, lineNumber, error) {
  return `${full}:: ${lineNumber >= 0 ? `line ${lineNumber + 1}:: ` : ''}${error}:: \n\n\t${line}\n`;
}

/**
 * @param {string[]} errors
 */
function throwOnErrors (errors) {
  if (errors.length) {
    exitFatal(errors.join('\n'));
  }
}

/**
 * @param {string[]} exts
 * @param {string} dir
 * @param {string} sub
 * @param {(path: string, line: string, lineNumber: number) => string | null | undefined} fn
 * @param {boolean} [allowComments]
 * @returns {string[]}
 */
function loopFiles (exts, dir, sub, fn, allowComments = false) {
  return fs
    .readdirSync(sub)
    .reduce((/** @type {string[]} */ errors, inner) => {
      const full = path.join(sub, inner);

      if (fs.statSync(full).isDirectory()) {
        return errors.concat(loopFiles(exts, dir, full, fn, allowComments));
      } else if (exts.some((e) => full.endsWith(e))) {
        fs
          .readFileSync(full, 'utf-8')
          .split('\n')
          .forEach((l, n) => {
            const t = l
              // no leading/trailing whitespace
              .trim()
              // anything starting with * (multi-line comments)
              .replace(/^\*.*/, '')
              // anything between /* ... */
              .replace(/\/\*.*\*\//g, '')
              // single line comments with // ...
              .replace(allowComments ? /--------------------/ : /\/\/.*/, '');
            const r = fn(`${dir}/${full}`, t, n);

            if (r) {
              errors.push(r);
            }
          });
      }

      return errors;
    }, []);
}

/**
 * @param {string} dir
 */
function lintOutput (dir) {
  throwOnErrors(
    loopFiles(['.d.ts', '.js', '.cjs'], dir, 'build', (full, l, n) => {
      if ((l.includes('import(') || (l.startsWith('import ') && l.includes(" from '"))) && l.includes('/src/')) {
        // we are not allowed to import from /src/
        return createError(full, l, n, 'Invalid import from /src/');
      // eslint-disable-next-line no-useless-escape
      } else if (/[\+\-\*\/\=\<\>\|\&\%\^\(\)\{\}\[\] ][0-9]{1,}n/.test(l)) {
        if (l.includes(';base64,')) {
          // ignore base64 encoding, e.g. data uris
        } else if (dir !== 'dev') {
          // we don't want untamed BigInt literals
          return createError(full, l, n, 'Prefer BigInt(<digits>) to <digits>n');
        }
      }

      return null;
    })
  );
}

/**
 * @param {string} dir
 */
function lintInput (dir) {
  throwOnErrors(
    loopFiles(['.ts', '.tsx'], dir, 'src', (full, l, n) => {
      // Sadly, we have people copying and just changing all the headers without giving attribution -
      // we certainly like forks, contributions, building on stuff, but doing this rebrand is not cool
      if (n === 0 && (
        !/\/\/ Copyright .* @polkadot\//.test(l) &&
        !/\/\/ Auto-generated via `/.test(l) &&
        !/#!\/usr\/bin\/env node/.test(l)
      )) {
        return createError(full, l, n, 'Invalid header definition');
      }

      return null;
    }, true)
  );
}

/**
 * @param {string} config
 * @returns {[string[], boolean, string[]]}
 */
function getReferences (config) {
  const configPath = path.join(process.cwd(), config);

  if (fs.existsSync(configPath)) {
    try {
      // We use the JSON5 parser here since we may have comments
      // (as allowed, per spec) in the actual tsconfig files
      /** @type {{ references: { path: string }[] }} */
      const tsconfig = JSON5.parse(fs.readFileSync(configPath, 'utf-8'));
      const paths = tsconfig.references.map(({ path }) => path);

      return [
        paths.map((path) =>
          path
            .replace('../', '')
            .replace('/tsconfig.build.json', '')
        ),
        true,
        paths
      ];
    } catch (error) {
      console.error(`Unable to parse ${configPath}`);

      throw error;
    }
  }

  return [[], false, []];
}

/**
 *
 * @param {CompileType} compileType
 * @param {string} dir
 * @param {[string, string][]} locals
 * @returns
 */
function lintDependencies (compileType, dir, locals) {
  const { dependencies = {}, devDependencies = {}, name, optionalDependencies = {}, peerDependencies = {}, private: isPrivate } = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf-8'));

  if (isPrivate) {
    return;
  }

  const checkDep = compileType === 'babel'
    ? '@babel/runtime'
    : compileType === 'swc'
      ? '@swc/helpers'
      : compileType === 'esbuild'
        ? null
        : 'tslib';

  if (checkDep && !dependencies[checkDep]) {
    throw new Error(`${name} does not include the ${checkDep} dependency`);
  }

  const deps = [
    ...Object.keys(dependencies),
    ...Object.keys(peerDependencies),
    ...Object.keys(optionalDependencies)
  ];
  const devDeps = [
    ...Object.keys(devDependencies),
    ...deps
  ];
  const [references] = getReferences('tsconfig.build.json');
  const [devRefs, hasDevConfig] = getReferences('tsconfig.spec.json');

  /** @type {string[]} */
  const refsFound = [];

  throwOnErrors(
    loopFiles(['.ts', '.tsx'], dir, 'src', (full, l, n) => {
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
          const isTest = full.endsWith('.spec.ts') || full.endsWith('.test.ts') || full.endsWith('.manual.ts') || full.includes('/test/');

          if (!(isTest ? devDeps : deps).includes(dep) && !deps.includes(dep.split('/')[0])) {
            return createError(full, l, n, `${dep} is not included in package.json dependencies`);
          } else if (local) {
            const ref = local[0];

            if (!(isTest && hasDevConfig ? devRefs : references).includes(ref)) {
              return createError(full, l, n, `../${ref} not included in ${(isTest && hasDevConfig ? 'tsconfig.spec.json' : 'tsconfig.build.json')} references`);
            }

            if (!refsFound.includes(ref)) {
              refsFound.push(ref);
            }
          }
        }
      }

      return null;
    })
  );

  const extraRefs = references.filter((r) => !refsFound.includes(r));

  if (extraRefs.length) {
    throwOnErrors([
      createError(`${dir}/tsconfig.build.json`, extraRefs.join(', '), -1, 'Unused tsconfig.build.json references found')
    ]);
  }
}

/**
 * @param {string} label
 * @param {() => unknown} fn
 */
async function timeIt (label, fn) {
  const start = Date.now();

  await Promise.resolve(fn());

  console.log(`${label} (${Date.now() - start}ms)`);
}

/**
 * @param {CompileType} compileType
 * @param {string} repoPath
 * @param {string} dir
 * @param {[string, string][]} locals
 * @returns {Promise<void>}
 */
async function buildJs (compileType, repoPath, dir, locals) {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf-8'));
  const { name, version } = pkgJson;

  if (!name.startsWith('@polkadot/')) {
    return;
  }

  lintInput(dir);

  console.log(`*** ${name} ${version}`);

  orderPackageJson(repoPath, dir, pkgJson);

  if (!fs.existsSync(path.join(process.cwd(), '.skip-build'))) {
    const srcHeader = `// Copyright 2017-${new Date().getFullYear()} ${name} authors & contributors\n// SPDX-License-Identifier: Apache-2.0\n`;
    const genHeader = `${srcHeader}\n// Do not edit, auto-generated by @polkadot/dev\n`;

    fs.writeFileSync(path.join(process.cwd(), 'src/packageInfo.ts'), `${genHeader}\nexport const packageInfo = { name: '${name}', path: 'auto', type: 'auto', version: '${version}' };\n`);

    if (!name.startsWith('@polkadot/x-')) {
      if (name !== '@polkadot/util' && !name.startsWith('@polkadot/dev')) {
        const detectOther = path.join(process.cwd(), 'src/detectOther.ts');

        if (!fs.existsSync(detectOther)) {
          fs.writeFileSync(detectOther, `${srcHeader}\n// Empty template, auto-generated by @polkadot/dev\n\nexport default [];\n`);
        }

        fs.writeFileSync(path.join(process.cwd(), 'src/detectPackage.ts'), `${genHeader}\nimport { detectPackage } from '@polkadot/util';\n\nimport others from './detectOther.js';\nimport { packageInfo } from './packageInfo.js';\n\ndetectPackage(packageInfo, null, others);\n`);
      }

      const cjsRoot = path.join(process.cwd(), 'src/cjs');

      if (fs.existsSync(path.join(cjsRoot, 'dirname.d.ts'))) {
        rimrafSync(cjsRoot);
      }
    }

    if (fs.existsSync(path.join(process.cwd(), 'public'))) {
      buildWebpack();
    } else {
      await compileJs(compileType, 'cjs');
      await compileJs(compileType, 'esm');

      // Deno
      await timeIt('Successfully compiled deno', () => {
        buildDeno();
      });

      await timeIt('Successfully rewrote imports', () => {
        // adjust the import paths (deno imports from .ts - can remove this on typescript 5)
        rewriteImports('build-deno', process.cwd(), pkgJson, adjustDenoPath);

        // adjust all output js esm to have .js path imports
        ['cjs', 'esm'].forEach((jsType) =>
          rewriteImports(`build-${compileType}-${jsType}`, process.cwd(), pkgJson, adjustJsPath)
        );
      });

      await timeIt('Successfully combined build', () => {
        // adjust all packageInfo.js files for the correct usage
        tweakPackageInfo(compileType);

        // copy output files (after import rewriting)
        copyBuildFiles(compileType, dir);
      });

      await timeIt('Successfully built exports', () => {
        // everything combined now, delete what we don't need
        deleteBuildFiles();

        // build the package.json exports
        buildExports();
      });

      await timeIt('Successfully linted configs', () => {
        lintOutput(dir);
        lintDependencies(compileType, dir, locals);
      });
    }
  }

  console.log();
}

/**
 * Finds any tsconfig.*.json files that are not included in the root
 * tsconfig.build.json
 */
function findUnusedTsConfig () {
  const [,, allPaths] = getReferences('tsconfig.build.json');
  const allPkgs = fs
    .readdirSync('packages')
    .filter((dir) =>
      fs.statSync(path.join(process.cwd(), 'packages', dir)).isDirectory() &&
      fs.existsSync(path.join(process.cwd(), 'packages', dir, 'src'))
    );
  /** @type {string[]} */
  const allConfigs = [];

  for (const pkg of allPkgs) {
    allConfigs.push(...fs
      .readdirSync(`packages/${pkg}`)
      .filter((f) =>
        f.startsWith('tsconfig.') &&
        f.endsWith('.json')
      )
      .map((f) => `./packages/${pkg}/${f}`)
    );
  }

  const missing = allConfigs.filter((c) => !allPaths.includes(c));

  if (missing.length) {
    throw new Error(`Not reflected in the root tsconfig.build.json: ${missing.join(', ')}`);
  }
}

/**
 * Main entry point
 */
async function main () {
  const args = process.argv.slice(2);

  /** @type {CompileType} */
  let compileType = 'tsc';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--compiler') {
      const type = args[++i];

      if (type === 'tsc') {
        compileType = type;
      } else {
        throw new Error(`Invalid --compiler ${type}`);
      }
    }
  }

  execSync('yarn polkadot-dev-clean-build');

  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf-8'));

  if (pkg.scripts) {
    if (pkg.scripts['build:extra']) {
      throw new Error('Found deprecated build:extra script, use build:before or build:after instead');
    }

    if (pkg.scripts['build:before']) {
      execSync('yarn build:before');
    }
  }

  const repoPath = pkg.repository.url
    .split('https://github.com/')[1]
    .split('.git')[0];

  orderPackageJson(repoPath, null, pkg);
  execSync('yarn polkadot-exec-tsc --build tsconfig.build.json');

  process.chdir('packages');

  const dirs = fs
    .readdirSync('.')
    .filter((dir) =>
      fs.statSync(dir).isDirectory() &&
      fs.existsSync(path.join(process.cwd(), dir, 'src'))
    );

  /** @type {[string, string][]} */
  const locals = [];

  // get all package names
  for (const dir of dirs) {
    const { name } = JSON.parse(fs.readFileSync(path.join(process.cwd(), dir, './package.json'), 'utf-8'));

    if (name.startsWith('@polkadot/')) {
      locals.push([dir, name]);
    }
  }

  // build packages
  for (const dir of dirs) {
    process.chdir(dir);

    await buildJs(compileType, repoPath, dir, locals);

    process.chdir('..');
  }

  process.chdir('..');

  findUnusedTsConfig();

  if (RL_CONFIGS.some((c) => fs.existsSync(path.join(process.cwd(), c)))) {
    execSync('yarn polkadot-exec-rollup --config');
  }

  if (pkg.scripts) {
    if (pkg.scripts['build:after']) {
      execSync('yarn build:after');
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
