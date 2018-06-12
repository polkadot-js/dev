// @flow

declare module 'memdown' {
  declare class MemDown {
    constructor (): MemDown;
  }

  declare module.exports: typeof MemDown;
}
