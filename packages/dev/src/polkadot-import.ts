// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider/ws';
import { u8aToHex } from '@polkadot/util/esm';

export interface ApiStuff {
  api: ApiPromise;
  provider: WsProvider;
}

export async function main (): Promise<boolean> {
  try {
    const api = await ApiPromise.create({ provider: new WsProvider() });
    const hash = await api.rpc.chain.getBlockHash();

    console.log('Ok', u8aToHex(hash));

    return true;
  } catch (error) {
    console.error('Error.');

    return false;
  }
}
