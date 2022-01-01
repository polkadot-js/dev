#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import execSync from './execSync.mjs';

const args = process.argv.slice(2).join(' ');

execSync(`yarn webpack ${args}`);
