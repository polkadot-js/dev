// @flow
// FIXME: Context types here are not accurate, rather it aligns with our specific use

import type { Middleware } from 'koa';

declare module 'koa-route' {
  declare type PostContextType = {
    body: string,
    req: http$IncomingMessage,
    type: 'application/json'
  };

  declare type WsContextType = {
    websocket: {
      on: (type: 'close' | 'message', (message: string) => void | Promise<void>) => void,
      send: (message: string) => void | Promise<void>
    }
  };

  declare module.exports: {
    post: (path: string, handler: (ctx: PostContextType) => any) => Middleware;
    all: (path: string, handler: (ctx: WsContextType) => any) => Middleware
  }
}
