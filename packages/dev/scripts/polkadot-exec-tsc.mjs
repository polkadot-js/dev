#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import { importDirect } from './util.mjs';

await importDirect('tsc', 'typescript/lib/tsc.js');
