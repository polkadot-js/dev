// @flow

declare module 'ip-regex' {
  declare type IpRegex$Options = {
    exact: boolean
  };

  declare module.exports: {
    (options?: IpRegex$Options): RegExp,

    v4: (options?: IpRegex$Options) => RegExp,
    v6: (options?: IpRegex$Options) => RegExp
  };
}
