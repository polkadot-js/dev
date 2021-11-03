#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importRelative } from './import.mjs';

importRelative('prettier', 'prettier/bin-prettier').then(() =>
  process.exit(0)
);
