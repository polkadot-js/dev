// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

export function copyFileSync (srcFile, destDir) {
  fs.copyFileSync(srcFile, path.join(destDir, path.basename(srcFile)));
}

export function copyDirSync (src, dest, extensions) {
  if (!fs.existsSync(src)) {
    // we don't check source availability
    return;
  } else if (!fs.statSync(src).isDirectory()) {
    throw new Error(`Source ${src} should be a directory`);
  }

  mkdirp.sync(dest);

  fs
    .readdirSync(src)
    .forEach((file) => {
      const srcPath = path.join(src, file);

      if (fs.statSync(srcPath).isDirectory()) {
        copyDirSync(srcPath, path.join(dest, file), extensions);
      } else if (!extensions || extensions.some((e) => file.endsWith(e))) {
        copyFileSync(srcPath, dest);
      }
    });
}
