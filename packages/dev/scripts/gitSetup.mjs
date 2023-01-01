// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execSync } from './execute.mjs';

const USER = 'github-actions[bot]';
const MAIL = '41898282+github-actions[bot]@users.noreply.github.com';

// const MAIL = process.env.GITHUB_REPOSITORY === 'polkadot-js/dev'
//   ? '41898282+github-actions[bot]@users.noreply.github.com'
//   : 'action@github.com';

export default function gitSetup () {
  execSync(`git config user.name "${USER}"`);
  execSync(`git config user.email "${MAIL}"`);

  execSync('git config push.default simple');
  execSync('git config merge.ours.driver true');

  execSync('git checkout master');
}
