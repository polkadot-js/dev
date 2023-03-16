// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-var */

import type { expect } from './env/expect.js';
import type { jest } from './env/jest.js';
import type { lifecycle } from './env/lifecycle.js';
import type { suite } from './env/suite.js';

type Expect = ReturnType<typeof expect>;

type Jest = ReturnType<typeof jest>;

type Lifecycle = ReturnType<typeof lifecycle>;

type Suite = ReturnType<typeof suite>;

declare global {
  var after: Lifecycle['after'];
  /** Jest-compatible alias for before */
  var afterAll: Lifecycle['afterAll'];
  var afterEach: Lifecycle['afterEach'];
  var before: Lifecycle['before'];
  /** Jest-compatible alias for after */
  var beforeAll: Lifecycle['beforeAll'];
  var beforeEach: Lifecycle['beforeEach'];
  var describe: Suite['describe'];
  var expect: Expect['expect'];
  var it: Suite['it'];
  var jest: Jest['jest'];
}

export {};
