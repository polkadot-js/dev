#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const reqPath = require('./requirePath.cjs');

require(reqPath('gh-release', 'gh-release/bin/cli'));
