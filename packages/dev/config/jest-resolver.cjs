// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from https://github.com/VitorLuizC/ts-jest-resolver/blob/e35fcd388f6503b5bcb701a216a4beb2df1e1f7e/src/index.ts#L1

// MIT License
// Copyright (c) 2021 Vitor Luiz Cavalcanti

const tests = [
  {
    exts: ['.tsx', '.ts', '.js'],
    re: /\.jsx?$/i
  }
];

module.exports = function (path, options) {
  const { exts, re } = tests.find(({ re }) => re.test(path)) || { exts: [] };

  if (re && exts.length) {
    for (let i = 0; i < exts.length; i++) {
      try {
        return options.defaultResolver(path.replace(re, exts[i]), options);
      } catch {
        // ignore
      }
    }
  }

  return options.defaultResolver(path, options);
};
