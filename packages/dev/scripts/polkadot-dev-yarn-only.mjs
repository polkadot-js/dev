#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { engineVersionCmp } from './util.mjs';

const BLANK = ''.padStart(75);
const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

if (engineVersionCmp(process.version, pkg.engines?.node) === -1) {
  console.error(
    `${BLANK}\n   FATAL: At least Node version ${pkg.engines.node} is required for development.\n${BLANK}`
  );

  console.error(`
      Technical explanation: For a development environment all projects in
      the @polkadot famility uses node:test in their operation. Currently the
      minimum required version of Node is thus set at the first first version
      with operational support, hence this limitation. Additionally only LTS
      Node versions are supported.

      LTS Node versions are detailed on https://nodejs.dev/en/about/releases/

  `);

  process.exit(1);
} else if (!process.env.npm_execpath?.includes('yarn')) {
  console.error(
    `${BLANK}\n   FATAL: The use of yarn is required, install via npm is not supported.\n${BLANK}`
  );
  console.error(`
      Technical explanation: All the projects in the @polkadot' family use
      yarn workspaces, along with hoisting of dependencies. Currently only
      yarn supports package.json workspaces, hence the limitation.

      If yarn is not available, you can get it from https://yarnpkg.com/

  `);

  process.exit(1);
}

process.exit(0);
