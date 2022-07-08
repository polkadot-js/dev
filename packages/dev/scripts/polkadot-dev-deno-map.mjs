#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';

const [e, i] = fs
  .readdirSync('packages')
  .filter((p) => fs.existsSync(`packages/${p}/src/mod.ts`))
  .sort()
  .reduce(([e, i], p) => {
    e.push(`export * as ${p.replace(/-/g, '_')} from 'https://deno.land/x/polkadot/${p}/mod.ts';`);
    i[`https://deno.land/x/polkadot/${p}/`] = `packages/${p}/build-deno/`;

    return [e, i];
  }, [[], {}]);

if (!fs.existsSync('mod.ts')) {
  fs.writeFileSync('mod.ts', `// Copyright 2017-${new Date().getFullYear()} @polkadot/dev authors & contributors\n// SPDX-License-Identifier: Apache-2.0\n\n// auto-generated via polkadot-dev-deno-map, do not edit\n\n${e.join('\n')}\n`);
}

if (fs.existsSync('import_map.add.json')) {
  const o = JSON.parse(fs.readFileSync('import_map.in.json', 'utf-8'));

  Object
    .entries(o.imports)
    .forEach(([k, v]) => {
      i[k] = v;
    });
}

fs.writeFileSync('import_map.json', JSON.stringify({ imports: i }, null, 2));
