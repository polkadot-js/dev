#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execNode } from './util.mjs';

execNode('polkadot-dev-run-test', 'ava/entrypoints/cli.mjs');
