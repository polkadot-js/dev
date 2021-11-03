#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importDirect } from './import.cjs';

process.env.NODE_OPTIONS = `--experimental-vm-modules${
  process.env.NODE_OPTIONS
    ? ` ${process.env.NODE_OPTIONS}`
    : ''
}`;

importDirect('polkadot-dev-run-test', 'jest-cli/bin/jest');
