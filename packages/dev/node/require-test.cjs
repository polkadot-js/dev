// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// This allows for compatibility with Jest environments using
// describe, it, test ...
//
// NOTE: node -r only works with commonjs files, hence using it here

const { JSDOM } = require('jsdom');
const { describe, test } = require('node:test');

function create (fn) {
  const wrap = (name, ...args) => fn(name, ...args);
  const flag = (flag) => (name, ...args) => fn(name, flag, ...args);

  wrap.only = flag({ only: true });
  wrap.skip = flag({ skip: true });
  wrap.todo = flag({ todo: true });

  return wrap;
}

globalThis.describe = create(describe);
globalThis.it = globalThis.test = create(test);

const dom = new JSDOM();

globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.window = dom.window;
