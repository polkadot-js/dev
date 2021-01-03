// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import circ2 from './circ2';

// we leave this as a warning... just a test
export default function circ1 (): number {
  circ2();

  return 123;
}
