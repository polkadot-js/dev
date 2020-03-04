// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const { execSync } = require('child_process');

module.exports = function exec (cmd) {
  console.log(`$ ${cmd}`);

  execSync(cmd, { stdio: 'inherit' });
}
