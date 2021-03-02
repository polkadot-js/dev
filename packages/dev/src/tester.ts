// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { tester } from '.';

tester();

console.log('  (2)', typeof require === 'undefined' ? 'mjs' : 'cjs');
