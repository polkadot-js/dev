// Copyright 2017-2019 @polkadot/dev-react authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

module.exports = {
  extends: '@polkadot/dev/config/tslint',
  rulesDirectory: 'tslint-react/rules/',
  rules: {
    indent: [true, 'spaces', 2],
    'jsx-alignment': true
  }
};
