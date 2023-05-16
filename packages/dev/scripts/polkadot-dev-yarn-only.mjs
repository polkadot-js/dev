#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import process from 'node:process';

import { exitFatalYarn } from './util.mjs';

exitFatalYarn();

process.exit(0);
