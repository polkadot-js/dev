// Copyright 2017-2025 @polkadot/dev-ts authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader
//
// NOTE: This assumes the loader implementation for Node.js >= 18

import { loaderOptions } from './common.js';

loaderOptions.isCached = true;

export { resolve } from './resolver.js';
export { load } from './testLoader.js';
