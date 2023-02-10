// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// This allows for compatibility with Jest environments using
// describe, it, test ...
//
// NOT: node -r only works with commonjs files, hence using it here

const n = require('node:test');

const describe = (name, ...args) => n.describe(name, ...args);
const it = (name, ...args) => n.it(name, ...args);

describe.only = (name, ...args) => describe(name, { only: true }, ...args);
it.only = (name, ...args) => it(name, { only: true }, ...args);

describe.skip = () => undefined;
it.skip = () => undefined;

globalThis.describe = describe;
globalThis.it = globalThis.test = it;
globalThis.test = it;
