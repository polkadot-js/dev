// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'path';

function noop () {
  // nothing
}

export function importDirect (bin, req, fn = noop) {
  console.log(`$ ${bin} ${process.argv.slice(2).join(' ')}`);

  return import(req)
    .then(fn)
    .catch(() => process.exit(1));
}

export function importRelative (bin, req, fn) {
  return importDirect(bin, path.join(process.cwd(), 'node_modules', req), fn);
}
