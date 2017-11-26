// ISC, Copyright 2017 Jaco Greeff
// @flow

type KoaBody$Options = {
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

declare module 'koa-body' {
  declare var exports: (options?: KoaBody$Options) => KoaRouter$Middleware
}
