// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

export class Testing123 {
  #something = 123_456_789;

  readonly and: number;

  constructor (and: number) {
    this.and = and;
    this.#something = this.#something & and;
  }

  get something (): number {
    return this.#something;
  }

  setSomething = (something: number): number => {
    this.#something = something;

    return this.#something;
  }

  toString (): string {
    return `something=${this.#something}`;
  }
}
