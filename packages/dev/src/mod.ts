// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './index.js';

import rollupAlias from '@rollup/plugin-alias';
import eslint from 'eslint/use-at-your-own-risk';
import nodeCrypto from 'node:crypto';

console.log('     eslint::', typeof eslint !== 'undefined');
console.log(' nodeCrypto::', typeof nodeCrypto !== 'undefined');
console.log('rollupAlias::', typeof rollupAlias !== 'undefined');
