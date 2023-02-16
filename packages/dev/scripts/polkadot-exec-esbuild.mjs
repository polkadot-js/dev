#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execViaNode } from './util.mjs';

execViaNode('esbuild', '../../../node_modules/esbuild/bin/esbuild');
