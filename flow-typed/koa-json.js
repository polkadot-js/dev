// ISC, Copyright 2017 Jaco Greeff
// @flow

type KoaJson$Options = {
  pretty?: boolean,
  param?: string
};

declare module 'koa-json' {
  declare var exports: (options?: KoaJson$Options) => KoaRouter$Middleware
}
