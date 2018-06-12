// @flow

declare module 'koa-body' {
  declare type KoaBody$Middleware = (
    ctx: any,
    next: () => void | Promise<void>
  ) => Promise<void> | void;

  declare type KoaBody$Options = {
    patchNode?: boolean,
    patchKoa?: boolean,
    jsonLimit?: string | number,
    formLimit?: string | number,
    textLimit?: string | number,
    encoding?: string,
    multipart?: boolean,
    urlencoded?: boolean,
    text?: boolean,
    json?: boolean,
    formidable?: any,
    onError?: (error: Error) => void,
    strict?: boolean
  };

  declare module.exports: (options?: KoaBody$Options) => KoaBody$Middleware
}
