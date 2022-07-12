// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'path';

export function importPath (req) {
  return path.join(process.cwd(), 'node_modules', req);
}

export async function importDirect (bin, req) {
  console.log(`$ ${bin} ${process.argv.slice(2).join(' ')}`);

  try {
    const mod = await import(req);

    return mod;
  } catch (error) {
    console.error(`Error importing ${req}`);
    console.error(error);
    process.exit(1);
  }
}

export function importRelative (bin, req) {
  return importDirect(bin, importPath(req));
}
