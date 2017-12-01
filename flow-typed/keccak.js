// @flow

declare module 'keccak' {
  declare type KeccakType = 'keccak256';

  declare module.exports: (type: KeccakType) => {
    update: (value: Buffer | string) => {
      digest: () => Buffer;
    }
  };
}
