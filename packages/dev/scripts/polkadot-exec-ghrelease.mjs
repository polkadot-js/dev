#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importRelative } from './util.mjs';

await importRelative('gh-release', 'gh-release/bin/cli.js');
