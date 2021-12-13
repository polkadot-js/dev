// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';

export default async function forEachPackage (fn) {
  process.chdir('packages');
  console.log();

  const dirs = fs
    .readdirSync('.')
    .filter((dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src')));

  for (const dir of dirs) {
    const { name, version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), dir, './package.json'), 'utf-8'));

    process.chdir(dir);
    console.log(`*** ${name} ${version}`);

    await fn(dir);

    console.log();
    process.chdir('..');
  }

  process.chdir('..');

  return dirs;
}
