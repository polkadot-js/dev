// @flow

declare module 'package-json' {
  declare type PackageJsonType$Dependencies = {
    [string]: string
  };

  declare type PackageJsonType = {
    dependencies: PackageJsonType$Dependencies,
    devDependencies: PackageJsonType$Dependencies,
    optionalDependencies?: PackageJsonType$Dependencies,
    peerDependencies?: PackageJsonType$Dependencies,
    name: string,
    version: string
  };

  declare module.exports: (name: string) => Promise<PackageJsonType>;
}
