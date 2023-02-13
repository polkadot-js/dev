// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { JSDOM } = require('jsdom');

/**
 * Export a very basic JSDom environment - this is just enough so we have
 * @testing-environment/react tests passing in this repo
 *
 * TODO: We actually want this to be optional, not always injected so
 * we need some flag to be passed through into the environment to
 * enable it. As it stands it appears on all usages
 */
function getBrowserKeys () {
  const { window } = new JSDOM();

  return {
    crypto: window.crypto,
    document: window.document,
    navigator: window.navigator,
    window
  };
}

module.exports = { getBrowserKeys };
