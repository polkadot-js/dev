// @flow

import type Koa from 'koa';

declare module 'koa-websocket' {
  declare type WsContextType = {
    websocket: {
      on: (type: 'close' | 'message', (message: string) => void | Promise<void>) => void,
      send: (message: string) => void | Promise<void>
    }
  };

  declare module.exports: {
    (app: Koa): Koa;

    all: (path: string, handler: (ctx: WsContextType) => void | Promise<void>) => void
  }
}
