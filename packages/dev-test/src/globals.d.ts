// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-var */

import type { Describe, Expect, It, Jest, Lifecycle } from './types.js';

declare global {
  var after: Lifecycle;
  /** Jest-compatible alias for before */
  var afterAll: Lifecycle;
  var afterEach: Lifecycle;
  var before: Lifecycle;
  /** Jest-compatible alias for after */
  var beforeAll: Lifecycle;
  var beforeEach: Lifecycle;
  var describe: Describe;
  var expect: Expect;
  var it: It;
  var jest: Jest;
}

export {};
