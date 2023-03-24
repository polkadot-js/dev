#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import { importRelative } from './util.mjs';

await importRelative('eslint', 'eslint/bin/eslint.js');
