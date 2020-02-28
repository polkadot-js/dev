#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const path = require('path');

execSync(`${path.join(__dirname, 'polkadot-ci-ghact-docs.sh')}`, { stdio: 'inherit' });
