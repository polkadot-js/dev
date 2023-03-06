// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-var, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

/// <reference types="./node" />

declare global {
  var window: typeof globalThis;
  var crypto: object;
  var document: object;
  var navigator: object;
}
