// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import cp from 'child_process';

export default function execute (cmd, noLog) {
  !noLog && console.log(`$ ${cmd}`);

  cp.execSync(cmd, { stdio: 'inherit' });
}
