// Copyright 2017-2019 @polkadot/dev-react authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('@polkadot/dev/config/eslint');

// we are doing some magic here - with eslint 5.x we would simply do
//   extends: ['@polkadot/dev/config/eslint', 'plugin:react/recommended']
// however in 6.x this doesn't quite seem to work.
module.exports = {
  ...base,
  extends: base.extends.concat([
    'plugin:react/recommended'
  ]),
  settings: {
    react: {
      version: 'detect'
    }
  }
};
