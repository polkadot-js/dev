#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

console.error('> gh-pages', process.argv.slice(2).join(' '));

require('gh-pages/bin/gh-pages')(process.argv)
  .then(() => {
    process.stdout.write('Published\n');
  })
  .catch(err => {
    process.stderr.write(`${err.message}\n`, () => process.exit(1));
  });
