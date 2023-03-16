// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { browser } from './browser.js';

const all = browser();

describe('browser', () => {
  it('contains window', () => {
    expect(all.window).toBeDefined();
  });

  it('contains a crypto implementation', () => {
    expect(all.crypto).toBeTruthy();
    expect(typeof all.crypto.getRandomValues).toBe('function');
  });

  it('contains the top-level objects', () => {
    expect(all.document).toBeDefined();
    expect(all.navigator).toBeDefined();
  });

  it('contains HTML*Element', () => {
    expect(typeof all.HTMLElement).toBe('function');
  });
});
