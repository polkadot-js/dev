// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { JSDOM } = require('jsdom');

/**
 * Export a very basic JSDom environment - this is just enough so we have
 * @testing-environment/react tests passing in this repo
 */
function browser () {
  const { window } = new JSDOM();

  return {
    HTMLElement: window.HTMLElement,
    crypto: window.crypto,
    document: window.document,
    navigator: window.navigator,
    window
  };
}

module.exports = { browser };
