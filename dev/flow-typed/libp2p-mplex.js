// @flow

declare module 'libp2p-mplex' {
  declare class LibP2PMultiplex {
    constructor (): LibP2PMultiplex;
  }

  declare module.exports: typeof LibP2PMultiplex;
}
