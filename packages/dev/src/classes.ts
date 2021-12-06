// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

export class Testing123 {
  #something = 123_456_789;

  readonly and: number;

  static staticProperty = 'babelIsCool';
  static staticFunction = (): string|null => Testing123.staticProperty;

  /**
   * @param and the number we should and with
   */
  constructor (and: number) {
    this.and = and;
    this.#something = this.#something & and;
  }

  get something (): number {
    return this.#something;
  }

  async doAsync (): Promise<boolean> {
    const res = await new Promise<boolean>((resolve) => resolve(true));

    console.log(res);

    return res;
  }

  /**
   * @description Sets something to something
   * @param something The addition
   */
  setSomething = (something: number): number => {
    this.#something = something;

    return this.#something;
  };

  toString (): string {
    return `something=${this.#something}`;
  }
}
