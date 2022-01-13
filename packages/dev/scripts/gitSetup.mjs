// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import execSync from './execSync.mjs';

const USER = 'github-actions[bot]';
// const MAIL = 'action@github.com';
const MAIL = '41898282+github-actions[bot]@users.noreply.github.com';

export default function gitSetup () {
  execSync(`git config user.name "${USER}"`);
  execSync(`git config user.email "${MAIL}"`);

  execSync('git config push.default simple');
  execSync('git config merge.ours.driver true');

  execSync('git checkout master');
}
