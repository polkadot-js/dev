// Copyright 2017-2023 @polkadot/dev-ts authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader
//
// NOTE: This assumes the new loader specification, so it would most-probably
// need a version of Node.js >= 18 (where the new specification has been
// introduced. It seems introduced at Node 16.12...)
//
// This is a bit of a pain since in dev mode we now need latest-ish Node
// versions, but at the same time we don't want to build against multiple APIs)

import { loaderOptions } from './common.js';

const url = new URL(import.meta.url);

loaderOptions.isCached = url.searchParams.get('isCached') === 'true';

export { load } from './loader.js';
export { resolve } from './resolver.js';
