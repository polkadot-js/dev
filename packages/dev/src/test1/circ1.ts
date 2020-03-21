// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import circ2 from './circ2';

// we leave this as a warning... just a test
export default function circ1 () {
  circ2();

  return 123;
}
