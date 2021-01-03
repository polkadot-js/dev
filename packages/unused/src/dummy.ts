// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface Dummy {
  dummy: string;
}

export default function dummy (): void {
  console.error('unused');
}
