// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

// @ts-expect-error We don't particularly wish to add a .d.ts for this
const configJs = require('@eslint/js');

module.exports = configJs.configs.recommended;
