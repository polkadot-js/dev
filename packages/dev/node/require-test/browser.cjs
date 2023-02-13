// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { JSDOM } = require('jsdom');

function expose (window) {
  return ['crypto', 'document', 'navigator'].reduce((env, key) => ({
    ...env,
    [key]: window[key]
  }), { window });
}

/** @internal just enough browser functionality for testing-library */
function getBrowserKeys () {
  return expose(new JSDOM().window);
}

module.exports = { getBrowserKeys };
