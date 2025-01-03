#!/usr/bin/env node
// Copyright 2017-2025 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importDirect } from './util.mjs';

await importDirect('webpack', 'webpack-cli/bin/cli.js');
