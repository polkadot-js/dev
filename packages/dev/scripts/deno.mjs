// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const denoIntPrefix = 'https://deno.land/x';
export const denoExtPrefix = 'https://esm.sh';

export function denoCreateName (name) {
  return name.replace('@polkadot/', 'polkadot/');
}

export function denoCreateDir (name) {
  // aligns with name above - since we have sub-paths, we only return
  // the actual package path (i.e. the last part of the name)
  return denoCreateName(name).replace('polkadot/', '');
}
