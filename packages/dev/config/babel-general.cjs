// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  generatorOpts: {
    shouldPrintComment: (value) =>
      value.includes('@polkadot') ||
      value.includes('SPDX-License-Identifier')
  }
};
