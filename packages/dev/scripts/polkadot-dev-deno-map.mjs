#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';

const [exports, imports] = fs
  .readdirSync('packages')
  .filter((p) => fs.existsSync(`packages/${p}/src/mod.ts`))
  .reduce(([exports, imports], p) => {
    exports.push(`export * as ${p.replace('-', '_')} from 'https://deno.land/x/polkadot/${p}/mod.ts';`);
    imports[`https://deno.land/x/polkadot/${p}/`] = `../packages/${p}/build-deno/`;

    return [exports, imports];
  }, [[], {}]);

fs.writeFileSync('deno/mod.ts', `// Copyright 2017-${new Date().getFullYear()} @polkadot/dev authors & contributors\n// SPDX-License-Identifier: Apache-2.0\n\n// auto-generated via polkadot-dev-deno-map, do not edit\n\n${exports.sort().join('\n')}\n`);

fs.writeFileSync('deno/import_map.json', JSON.stringify({ imports }, null, 2));
