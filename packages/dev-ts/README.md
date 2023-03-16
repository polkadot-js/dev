# @polkadot/dev-ts

This is an Node TS loader, specifically written to cater for the polkadot-js needs, aka it is meant to be used inside polkadot-js projects. It doesn't aim to be a catch-all resolver, although it does cover quite a large spectrum of functionality.

It caters for -

1. Pass through resolution and compiling of .ts & .tsx sources
2. Resolution of TS aliases
3. Resolution of .json files (alongside aliases)
4. Resolution of extensionless imports (basic, best-effort)


## Usage

Just add the loader via the Node.js `--loader` option. The API supported here is only for Node 16.12+, so ensure a new-ish LTS version is used.

```
node --loader @polkadot/dev-ts ...
```

Internally to the polkadot-js libraries, loader caching is used. This means that compiled files are store on-disk alongside the `/src/` folder in `/build-loader/`. To enable caching behavior, the loader endpoint is changed slightly,

```
node --loader @polkadot/dev-ts/cached ...
```

This is generally the suggested default, but it is only exposed via a different loader endpoint to ensure that users explicitly opt-in and not be suprised by "random output folders" being created.


## Caveats

The Node.js loader API could change in the future (as it has in the Node.js 16.12 version), so it _may_ break or stop working on newer versions, and obviously won't work at all on older versions. As of this writing (Node.js 18.14 being the most-recent LTS), using the `--loader` option will print a warning.

With all that said, it is used as-is for the polkadot-js test infrastructure and currently operates without issues in _that_ environment.

TL;DR Different configs could yield some issues.


## Why

Yes, there are other options available - [@babel/register](https://babeljs.io/docs/babel-register), [@esbuild-kit/esm-loader](https://github.com/esbuild-kit/esm-loader), [@swc/register](https://github.com/swc-project/register), [@swc-node/loader](https://github.com/swc-project/swc-node/tree/master/packages/loader), [ts-node/esm](https://github.com/TypeStrong/ts-node), ...

We started off with a basic `swc` loader (after swapping the infrastructure from Jest & Babel), just due to the fact that (at that time, and as of writing still) the base swc loader is still a WIP against the newer loader APIs. Since we didn't want to add more dependencies (and compile differently to our internal compiler infrastructure), we [adapted our own](https://nodejs.org/api/esm.html#esm_transpiler_loader).

Since then we just swapped to using base `tsc` everywhere (for all builds) and may look at changing again (swc, esbuild. etc...) in the future. So effectively having a single loader, while re-inventing the wheel somewhat (since there seems to be a _lot_ of options available) allows us to just keep the loader compiling options fully aligned with what TS -> JS output approach we take.

It meets our requirements: aligns fully with the overall configs we accross polkadot-js, compiles to ESM (no CJS used when testing/running) and has minimal dependencies that doesn't add bloat. In most cases you would probably be better off with one of the loaders/registration approaches linked in the first paragraph.
