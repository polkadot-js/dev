// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// adapted from the unmaintained https://github.com/mysticatea/cpx implementation
// Copyright (c) 2015 Toru Nagashima under MIT
//
// This only uses the sync copy needed and removed unneeded dependencies (such as ancient chokidar)

const fs = require('fs-extra');
const glob = require('glob');
const glob2base = require('glob2base');
const { Minimatch } = require('minimatch');
const path = require('path');

function normalizePath (originalPath) {
  const normalizedPath = path
    .relative(process.cwd(), path.resolve(originalPath))
    .replace(/\\/g, '/');

  return /\/$/.test(normalizedPath)
    ? normalizedPath.slice(0, -1)
    : normalizedPath || '.';
}

module.exports = function copySync (src, dst) {
  const normalizedSource = normalizePath(src);
  const normalizedOutputDir = normalizePath(dst);
  const baseDir = normalizePath(glob2base({ minimatch: new Minimatch(normalizedSource) }));

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
};
