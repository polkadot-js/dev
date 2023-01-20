// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

export function copyFileSync (src, destDir) {
  if (Array.isArray(src)) {
    src.forEach((s) => copyFileSync(s, destDir));
  } else {
    fs.copyFileSync(src, path.join(destDir, path.basename(src)));
  }
}

export function copyDirSync (src, dest, extensions) {
  if (Array.isArray(src)) {
    src.forEach((s) => copyDirSync(s, dest, extensions));
  } else if (!fs.existsSync(src)) {
    // it doesn't exist, so we have nothing to copy
  } else if (!fs.statSync(src).isDirectory()) {
    throw new Error(`Source ${src} should be a directory`);
  } else {
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
}
