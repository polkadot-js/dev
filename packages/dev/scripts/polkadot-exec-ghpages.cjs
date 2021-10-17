#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const reqPath = require('./requirePath.cjs');

require(reqPath('gh-pages', 'gh-pages/bin/gh-pages'))(process.argv)
  .then(() => {
    process.stdout.write('Published\n');
  })
  .catch((error) => {
    process.stderr.write(`${error.message}\n`, () => process.exit(1));
  });
