// Copyright 2017-2024 @polkadot/dev-ts authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader
//
// NOTE: This assumes the loader implementation for Node.js >= 18

import { loaderOptions } from './common.js';

loaderOptions.isCached = new URL(import.meta.url).searchParams.get('isCached') === 'true';

export { load } from './loader.js';
export { resolve } from './resolver.js';
