#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importRelative } from './import.mjs';

const fn = await importRelative('gh-pages', 'gh-pages/bin/gh-pages.js');

fn(process.argv);

process.stdout.write('Published\n');
