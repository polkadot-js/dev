// https://github.com/flowtype/flow-typed/blob/b3d21ff5bc48906c8cd3b2b6a4b094a625f62cae/definitions/npm/koa-router_v7.2.x/flow_v0.25.x-/koa-router_v7.2.x.js
// @flow

declare module 'koa-router' {
  declare type KoaRouter$Middleware = (
    ctx: any,
    next: () => void | Promise<void>
  ) => Promise<void> | void;

  declare type KoaRouter$ParamMiddleware = (
    param: string,
    ctx: any,
    next: () => void | Promise<void>
  ) => Promise<void> | void;

  declare class Router {
    constructor(opts?: {
      prefix?: string,
      sensitive?: boolean,
      strict?: boolean,
      methods?: Array<string>
    }): Router;

    get(
      name: string,
      route: string | string[],
      handler: KoaRouter$Middleware
    ): this;
    get(route: string | string[], handler: KoaRouter$Middleware): this;

    patch(
      name: string,
      route: string | string[],
      handler: KoaRouter$Middleware
    ): this;
    patch(route: string | string[], handler: KoaRouter$Middleware): this;

    post(
      name: string,
      route: string | string[],
      handler: KoaRouter$Middleware
    ): this;
    post(route: string | string[], handler: KoaRouter$Middleware): this;

    put(
      name: string,
      route: string | string[],
      handler: KoaRouter$Middleware
    ): this;
    put(route: string | string[], handler: KoaRouter$Middleware): this;

    delete(
      name: string,
      route: string | string[],
      handler: KoaRouter$Middleware
    ): this;
    delete(route: string | string[], handler: KoaRouter$Middleware): this;

    del(
      name: string,
      route: string | string[],
      handler: KoaRouter$Middleware
    ): this;
    del(route: string | string[], handler: KoaRouter$Middleware): this;

    use(...middleware: Array<KoaRouter$Middleware>): this;
    use(
      path: string | Array<string>,
      ...middleware: Array<KoaRouter$Middleware>
    ): this;

    prefix(prefix: string): this;

    routes(): KoaRouter$Middleware;

    allowedMethods(options?: {
      throw?: boolean,
      notImplemented?: () => any,
      methodNotAllowed?: () => any
    }): KoaRouter$Middleware;

    param(param: string, middleware: KoaRouter$ParamMiddleware): this;

    redirect(source: string, destination: string, code?: number): this;

    route(name: string): any | false;

    url(name: string, params?: any): string | Error;

    static url(path: string, params: Object): string;
  }

  declare module.exports: typeof Router;
}
