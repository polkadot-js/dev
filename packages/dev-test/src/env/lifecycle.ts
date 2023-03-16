// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { after, afterEach, before, beforeEach } from 'node:test';

/**
 * This ensures that the before/after functions are exposed
 **/
export function lifecycle () {
  return {
    after,
    afterAll: after,
    afterEach,
    before,
    beforeAll: before,
    beforeEach
  };
}
