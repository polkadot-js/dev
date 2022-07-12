#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { requireRelative } from './import.mjs';

requireRelative('gh-pages', 'gh-pages/bin/gh-pages.js')(process.argv);

process.stdout.write('Published\n');
