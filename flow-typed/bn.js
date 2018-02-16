// Significantly expanded from the original at
// https://github.com/theblock/theblock.github.io/blob/f25e185b90b682dd7542142df558170258d09c88/flow-typed/bn.js
// @flow

declare module 'bn.js' {
  declare class BN {
    constructor (value?: any, base: ?number): BN;

    abs (): BN;
    iabs (): BN;
    uabs (): BN;
    add (value: BN): BN;
    addn (value: number): BN;
    iadd (value: BN): BN;
    iaddn (value: number): BN;
    uadd (value: BN): BN;
    uaddn (value: number): BN;
    and (value: BN): BN;
    andn (value: number): BN;
    iand (value: BN): BN;
    iandn (value: number): BN;
    uand (value: BN): BN;
    uandn (value: number): BN;
    bincn (num: number): BN;
    bitLength (): number;
    byteLength (): number;
    clone (): BN;
    cmp (value: BN): boolean;
    cmpn (value: number): boolean;
    div (value: BN): BN;
    divn (value: number): BN;
    idiv (value: BN): BN;
    idivn (value: number): BN;
    udiv (value: BN): BN;
    udivn (value: number): BN;
    divRound (value: BN): BN;
    divRoundn (value: number): BN;
    idivRound (value: BN): BN;
    idivRoundn (value: number): BN;
    udivRound (value: BN): BN;
    udivRoundn (value: number): BN;
    eq (value: BN): boolean;
    eqn (value: number): boolean;
    fromTwos (width: number): BN;
    gt (value: BN): boolean;
    gtn (value: number): boolean;
    gte (value: BN): boolean;
    gten (value: number): boolean;
    isEven (): boolean;
    isNeg (): boolean;
    isOdd (): boolean;
    isZero (): boolean;
    lt (value: BN): boolean;
    ltn (value: number): boolean;
    lte (value: BN): boolean;
    lten (value: number): boolean;
    maskn (mask: number): BN;
    imaskn (mask: number): BN;
    umaskn (mask: number): BN;
    mod (mod: BN): BN;
    modn (mod: number): BN;
    imod (mod: BN): BN;
    imodn (mod: number): BN;
    umod (mod: BN): BN;
    umodn (mod: number): BN;
    mul (value: BN): BN;
    muln (value: number): BN;
    imul (value: BN): BN;
    imuln (value: number): BN;
    umul (value: BN): BN;
    umuln (value: number): BN;
    neg (): BN;
    notn (bit: number): BN;
    or (value: BN): BN;
    ot (value: number): BN;
    pow (pow: BN): BN;
    pown (pow: number): BN;
    ipow (pow: BN): BN;
    ipown (pow: number): BN;
    upow (pow: BN): BN;
    upown (pow: number): BN;
    setn (bit: number): BN;
    shln (num: number): BN;
    iushln (num: number): BN;
    ushln (num: number): BN;
    shrn (num: number): BN;
    iushrn (num: number): BN;
    ushrn (num: number): BN;
    sqr (): BN;
    isqr (): BN;
    sub (value: BN): BN;
    subn (value: number): BN;
    isub (value: BN): BN;
    isubn (value: number): BN;
    usub (value: BN): BN;
    usubn (value: number): BN;
    testn (bit: number): BN;
    toArray (endian?: 'be' | 'le', length?: number): Array<number>;
    toArrayLike (type: Class<any>, endian?: 'be' | 'le', length?: number): any;
    toBuffer (endian?: 'be' | 'le', length?: number): Buffer;
    toJSON (): string;
    toNumber (): number;
    toString (base?: number, padding?: number): string;
    toTwos (width: number): BN;
    xor (value: BN): BN;
    xorn (value: number): BN;
    ixor (value: BN): BN;
    ixorn (value: number): BN;
    uxor (value: BN): BN;
    uxorn (value: number): BN;
    zeroBits (): number;

    static isBN (value?: any): boolean;
  }

  declare module.exports: typeof BN;
}
