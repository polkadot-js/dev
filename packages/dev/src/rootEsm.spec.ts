// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference types="@polkadot/dev-test/globals.d.ts" />

import type * as testRoot from './root.js';

import fs from 'node:fs';
import path from 'node:path';

// NOTE We don't use ts-expect-error here since the build folder may or may
// not exist (so the error may or may not be there)
//
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore This should only run against the compiled ouput, where this should exist
import * as testRootBuild from '../build/root.js';
import { runTests } from './rootTests.js';

runTests(testRootBuild as unknown as typeof testRoot);

describe('as-built output checks', (): void => {
  const buildRoot = path.join(process.cwd(), 'packages/dev/build');
  const buildFiles = fs.readdirSync(buildRoot);

  describe('build outputs', (): void => {
    it('does not contain the *.spec.ts/js files', (): void => {
      expect(
        buildFiles.filter((f) => f.includes('.spec.'))
      ).toEqual([]);
    });

    it('does not contain the rootRust folder', (): void => {
      expect(
        buildFiles.filter((f) => f.includes('rootRust'))
      ).toEqual([]);
    });

    it('has the static files copied (non-duplicated)', (): void => {
      expect(
        fs.existsSync(path.join(buildRoot, 'rootStatic/kusama.svg'))
      ).toBe(true);
      expect(
        fs.existsSync(path.join(buildRoot, 'cjs/rootStatic/kusama.svg'))
      ).toBe(false);
    });

    it('does not have stand-alone d.ts files copied', (): void => {
      expect(
        fs.existsSync(path.join(buildRoot, 'rootJs/test.json.d.ts'))
      ).toBe(false);
    });

    it('does have cjs + d.ts files copied', (): void => {
      expect(
        fs.existsSync(path.join(process.cwd(), 'packages/dev-test/build/globals.d.ts'))
      ).toBe(true);
    });
  });

  describe('code generation', (): void => {
    const jsIdx = {
      cjs: fs.readFileSync(path.join(buildRoot, 'cjs/rootJs/index.js'), { encoding: 'utf-8' }),
      esm: fs.readFileSync(path.join(buildRoot, 'rootJs/index.js'), { encoding: 'utf-8' })
    } as const;
    const idxTypes = Object.keys(jsIdx) as (keyof typeof jsIdx)[];

    describe('numeric seperators', (): void => {
      idxTypes.forEach((type) =>
        it(`does not conatin them & has the value in ${type}`, (): void => {
          expect(
            jsIdx[type].includes('123_456_789n')
          ).toBe(false);
          expect(
            jsIdx[type].includes('123456789n')
          ).toBe(true);
        })
      );
    });

    describe('dynamic imports', (): void => {
      idxTypes.forEach((type) =>
        it(`contains import(...) in ${type}`, (): void => {
          expect(
            jsIdx[type].includes("const { sum } = await import('@polkadot/dev/rootJs/dynamic.mjs');")
          ).toBe(true);
        })
      );
    });

    describe('type assertions', (): void => {
      idxTypes.forEach((type) =>
        it(`contains import(...) in ${type}`, (): void => {
          expect(
            jsIdx[type].includes(
              type === 'cjs'
                ? 'require("@polkadot/dev/rootJs/testJson.json")'
                : "import testJson from '@polkadot/dev/rootJs/testJson.json' assert { type: 'json' };"
            )
          ).toBe(true);
        })
      );
    });
  });

  describe('commonjs', (): void => {
    const cjsRoot = path.join(buildRoot, 'cjs');

    it('contains commonjs package.js inside cjs', (): void => {
      expect(
        fs
          .readFileSync(path.join(cjsRoot, 'package.json'), { encoding: 'utf-8' })
          .includes('"type": "commonjs"')
      ).toBe(true);
    });

    it('contains cjs/sample.js', (): void => {
      expect(
        fs
          .readFileSync(path.join(cjsRoot, 'sample.js'), { encoding: 'utf-8' })
          .includes("module.exports = { foo: 'bar' };")
      ).toBe(true);
    });
  });

  describe('deno', (): void => {
    const denoRoot = path.join(process.cwd(), 'packages/dev/build-deno');
    const denoMod = fs.readFileSync(path.join(denoRoot, 'mod.ts'), 'utf-8');

    it('has *.ts imports', (): void => {
      expect(
        denoMod.includes("import './index.ts';")
      ).toBe(true);
    });

    it('has node: imports', (): void => {
      expect(
        denoMod.includes("import nodeCrypto from 'node:crypto';")
      ).toBe(true);
    });

    it('has deno.land/x imports', (): void => {
      expect(
        fs
          .readFileSync(path.join(denoRoot, 'rootJs/augmented.ts'))
          .includes("declare module 'https://deno.land/x/polkadot/dev/types.ts' {")
      ).toBe(true);
    });

    // See https://github.com/denoland/deno/issues/18557
    // NOTE: When available, the toBe(false) should be toBe(true)
    describe.todo('npm: prefixes', (): void => {
      it('has npm: imports', (): void => {
        expect(
          /import rollupAlias from 'npm:@rollup\/plugin-alias@\^\d\d?\.\d\d?\.\d\d?';/.test(denoMod)
        ).toBe(false); // true);
      });

      it('has npm: imports with paths', (): void => {
        expect(
          /import eslint from 'npm:eslint@\^\d\d?\.\d\d?\.\d\d?\/use-at-your-own-risk';/.test(denoMod)
        ).toBe(false); // true);
      });
    });
  });
});
