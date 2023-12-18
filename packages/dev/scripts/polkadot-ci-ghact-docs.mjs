#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execPm, GITHUB_REPO, GITHUB_TOKEN_URL, gitSetup, logBin } from './util.mjs';

const repo = `${GITHUB_TOKEN_URL}/${GITHUB_REPO}.git`;

logBin('polkadot-ci-ghact-docs');

gitSetup();

execPm('run docs');
execPm(`polkadot-exec-ghpages --dotfiles --repo ${repo} --dist ${process.env['GH_PAGES_SRC']} --dest .`, true);
