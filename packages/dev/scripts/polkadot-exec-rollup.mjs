#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import { execViaNode } from './util.mjs';

execViaNode('rollup', 'rollup/dist/bin/rollup');
