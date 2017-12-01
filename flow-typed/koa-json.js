// @flow

declare module 'koa-json' {
  declare type KoaJson$Options = {
    pretty?: boolean,
    param?: string
  };

  declare var exports: (options?: KoaJson$Options) => KoaRouter$Middleware
}
