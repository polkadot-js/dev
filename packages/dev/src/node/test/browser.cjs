// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

// This allows for compatibility with Jest environments using
// describe, it, test ...
//
// NOTE: node --require only works with commonjs files, hence using it here
// NOTE: --import was added in Node 19 that would simplify, but too early

const { exposeEnv } = require('./env/index.cjs');

exposeEnv(true);
