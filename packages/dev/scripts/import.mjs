// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'path';

export function importRelative (bin, req) {
  console.log(`$ ${bin} ${process.argv.slice(2).join(' ')}`);

  return import(path.join(process.cwd(), 'node_modules', req)).catch((error) =>
    process.stderr.write(`${error.message}\n`, () => process.exit(1))
  );
}

export function importDirect (bin, req) {
  console.log(`$ ${bin} ${process.argv.slice(2).join(' ')}`);

  return import(req).catch((error) =>
    process.stderr.write(`${error.message}\n`, () => process.exit(1))
  );
}
