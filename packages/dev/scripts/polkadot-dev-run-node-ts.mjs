#!/usr/bin/env node
// Copyright 2017-2024 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execNodeTs, logBin } from './util.mjs';

logBin('polkadot-run-node-ts');

execNodeTs(process.argv.slice(2).join(' '));
