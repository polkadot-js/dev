// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './augmented';

import * as bob from './test1';

const dynamic = import('./testRoot').catch(console.error);

interface Some {
  thing?: {
    else: () => boolean;
  }
}

export class Clazz {
  some?: Some;

  #dynamic: unknown;

  static statMem = '123';

  constructor () {
    this.#dynamic = dynamic;
  }

  get isDynamic (): boolean {
    return !!this.#dynamic;
  }

  getBob (): unknown {
    return bob;
  }

  someThingElse (): boolean {
    return this.some?.thing?.else() ?? false;
  }
}
