#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';

import { DENO_POL_PRE } from './util.mjs';

const [e, i] = fs
  .readdirSync('packages')
  .filter((p) => fs.existsSync(`packages/${p}/src/mod.ts`))
  .sort()
  .reduce((/** @type {[string[], Record<String, string>]} */ [e, i], p) => {
    e.push(`export * as ${p.replace(/-/g, '_')} from '${DENO_POL_PRE}/${p}/mod.ts';`);
    i[`${DENO_POL_PRE}/${p}/`] = `./packages/${p}/build-deno/`;

    return [e, i];
  }, [[], {}]);

if (!fs.existsSync('mod.ts')) {
  fs.writeFileSync('mod.ts', `// Copyright 2017-${new Date().getFullYear()} @polkadot/dev authors & contributors\n// SPDX-License-Identifier: Apache-2.0\n\n// auto-generated via polkadot-dev-deno-map, do not edit\n\n// This is a Deno file, so we can allow .ts imports
  /* eslint-disable import/extensions */\n\n${e.join('\n')}\n`);
}

if (fs.existsSync('import_map.in.json')) {
  const o = JSON.parse(fs.readFileSync('import_map.in.json', 'utf-8'));

  Object
    .entries(o.imports)
    .forEach(([k, v]) => {
      i[k] = v;
    });
}

fs.writeFileSync('import_map.json', JSON.stringify({ imports: i }, null, 2));
