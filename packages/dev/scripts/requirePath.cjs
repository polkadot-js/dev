// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');

module.exports = function requireBin (bin, req) {
  console.log(`$ ${bin} ${process.argv.slice(2).join(' ')}`);

  return path.join(process.cwd(), 'node_modules', req);
};
