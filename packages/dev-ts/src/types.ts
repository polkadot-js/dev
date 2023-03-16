// Copyright 2017-2023 @polkadot/dev-ts authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface Alias {
  filter: string[];
  isWildcard?: boolean;
  path: string;
  url: URL;
}

export interface LoaderOptions {
  isCached?: boolean;
}
