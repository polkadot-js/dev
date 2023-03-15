// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader
//
// NOTE: This assumes the new loader specification, so it would most-probably
// need a version of Node.js >= 18 (where the new specification has been
// introduced)
//
// This is a bit of a pain since in dev mode we now need latest-ish Node
// versions, but at the same time we don't want to build against multiple APIs)

export { load } from './loader.js';
export { resolve } from './resolver.js';
