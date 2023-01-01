#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importRelative } from './import.mjs';

const ghp = await importRelative('gh-pages', 'gh-pages/bin/gh-pages.js');

await ghp.default(process.argv);

console.log('Published');
