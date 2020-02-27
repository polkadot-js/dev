// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// Adapted from
// https://github.com/yarnpkg/pnp-sample-app/blob/f4ec67f81134115bf922d5d70d7d062e4bbe80dd/scripts/eslint-resolver.js
//
// settings: {
//   'import/resolver': {
//     [require.resolve('./eslint-resolver.js')]: {}
//   }
// }

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pnp = require('./.pnp.js');

module.exports = {
  interfaceVersion: 2,
  resolve: (source, file) => {
    console.error(source, file);

    try {
      return { found: true, path: pnp.resolveRequest(source, file) };
    } catch (error) {
      return { found: false };
    }
  }
};
