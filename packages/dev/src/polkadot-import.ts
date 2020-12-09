// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider/ws';

ApiPromise
  .create({ provider: new WsProvider() })
  .then(console.log)
  .catch(console.error);
