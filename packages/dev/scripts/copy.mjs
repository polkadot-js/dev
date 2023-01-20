// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// adapted from the unmaintained https://github.com/mysticatea/cpx implementation
// Copyright (c) 2015 Toru Nagashima under MIT
//
// This only uses the sync copy needed and removed unneeded dependencies (such as ancient chokidar)

import fs from 'fs-extra';
import glob from 'glob';
import glob2base from 'glob2base';
import minimatch from 'minimatch';
import mkdirp from 'mkdirp';
import path from 'path';

function normalizePath (originalPath) {
  const normalizedPath = path
    .relative(process.cwd(), path.resolve(originalPath))
    .replace(/\\/g, '/');

  return /\/$/.test(normalizedPath)
    ? normalizedPath.slice(0, -1)
    : normalizedPath || '.';
}

export function copySync (src, dst) {
  const normalizedSource = normalizePath(src);
  const normalizedOutputDir = normalizePath(dst);
  const baseDir = normalizePath(glob2base({ minimatch: new minimatch.Minimatch(normalizedSource) }));

  glob
    .sync(normalizedSource, {
      follow: false,
      nodir: true,
      silent: true
    })
    .forEach((src) => {
      const dst = baseDir === '.'
        ? path.join(normalizedOutputDir, src)
        : src.replace(baseDir, normalizedOutputDir);

      if (dst !== src) {
        const stat = fs.statSync(src);

        if (stat.isDirectory()) {
          fs.ensureDirSync(dst);
        } else {
          fs.ensureDirSync(path.dirname(dst));
          fs.copySync(src, dst);
        }

        fs.chmodSync(dst, stat.mode);
      }
    });
}

export function copyFileSync (srcFile, destFile) {
  fs.copyFileSync(srcFile, destFile);
}

export function copyDirSync (src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source ${src} directory does not exist`);
  } else if (!fs.fstatSync(src).isDirectory) {
    throw new Error(`Source ${src} should be a directory`);
  }

  mkdirp.sync(dest);

  fs
    .readdirSync(src)
    .forEach((file) => {
      const srcPath = path.join(src, file);
      const dstPath = path.join(dest, file);

      if (fs.fstatSync(srcPath).isDirectory) {
        copyDirSync(srcPath, dstPath);
      } else {
        copyFileSync(srcPath, dstPath);
      }
    });
}
