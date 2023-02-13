// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { JSDOM } = require('jsdom');

/**
 * @internal
 *
 * Export a very basic JSDom environment - this is just enough so we have
 * @testing-environment/react tests passing in this repo
 *
 * TODO: We actually want this to be optional, not always injected so
 * we need some flag to be passed through into the environment to
 * enable it. As it stands it appears on all usages
 */
function expose (window) {
  return ['crypto', 'document', 'navigator'].reduce((env, key) => ({
    ...env,
    [key]: window[key]
  }), { window });
}

/**
 * Expose the required browser keys, as extracted from a JSDOM instance
 */
function getBrowserKeys () {
  return expose(new JSDOM().window);
}

module.exports = { getBrowserKeys };
