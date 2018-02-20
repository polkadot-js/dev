// @flow

declare module 'blakejs' {
  declare module.exports: {
    blake2b: (data: Uint8Array, key?: Uint8Array | null, outlen?: number) => Uint8Array
    blake2s: (data: Uint8Array, key?: Uint8Array | null, outlen?: number) => Uint8Array
  }
}
