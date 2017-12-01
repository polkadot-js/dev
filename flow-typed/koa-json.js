// @flow

declare module 'koa-json' {
  declare type KoaJson$Middleware = (
    ctx: any,
    next: () => void | Promise<void>
  ) => Promise<void> | void;

  declare type KoaJson$Options = {
    pretty?: boolean,
    param?: string
  };

  declare var exports: (options?: KoaJson$Options) => KoaJson$Middleware
}
