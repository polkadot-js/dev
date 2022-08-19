#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importDirect } from './import.mjs';

await importDirect('webpack', 'webpack-cli/bin/cli.js');
