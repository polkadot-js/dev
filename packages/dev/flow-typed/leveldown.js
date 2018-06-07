// @flow

declare module 'leveldown' {
  declare class LevelDown {
    constructor (path: string): LevelDown;
  }

  declare module.exports: typeof LevelDown;
}
