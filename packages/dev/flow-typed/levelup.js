// @flow

declare module 'levelup' {
  declare interface LevelUp$AbstractStorage {
  }

  declare class LevelUp {
    constructor (provider: LevelUp$AbstractStorage): LevelUp;
  }

  declare module.exports: typeof LevelUp;
}
