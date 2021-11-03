// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');

function importDirect (bin, req) {
  console.log(`$ ${bin} ${process.argv.slice(2).join(' ')}`);

  return require(req);
}

function importRelative (bin, req) {
  return importDirect(bin, path.join(process.cwd(), 'node_modules', req));
}

module.exports = {
  importDirect,
  importRelative
};
