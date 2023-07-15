# CHANGELOG

## 0.76.1

- Update to latest typescript-eslint (incl. new rulesets)


## 0.75.1

- Swap eslint to flat config


## 0.74.1

- Ensure correct structures for `tsconfig.*.json`


## 0.73.1

- Drop support for Node 14


## 0.72.1

- Split `@polkadot/dev-ts` & `@polkadot/dev-test` packages


## 0.71.1

- Ensure all `src/*` has `.js` extensions (as per ESM, eslint rules, build updates)


## 0.70.1

- Remove Babel (all compilation via tsc)


## 0.69.1

- Remove Jest


## 0.68.1

- 2023
- Cleanup internally used script dependencies


## 0.67.1

- Default to `esModuleInterop: false`


## 0.66.1

- Output commonjs into `cjs/*`


## 0.65.1

- 2022
- Generate `detectPackage` template (with cjs `__dirname`)


## 0.64.1

- Use tsconfig references and per-package TS build/lint


## 0.63.1

- eslint 8


## 0.62.1

- Swap default package build to esm with type: module


## 0.61.1

- Build & publish both esm and cjs


## 0.60.1

- Allow for both esm & cjs Babel config


## 0.59.1

- Default to new React runtime preset (after React 16.14)


## 0.58.1

- Drop vuepress dependency completely


## 0.57.1

- Drop lerna dependency completely


## 0.56.1

- Optional lerna in publish


## 0.55.3

- Publish draft release


## 0.54.1

- typescript-eslint 3


## 0.53.1

- TypeScript 3.9


## 0.52.1

- Stricter JSX rules


## 0.51.1

- Arrow functions with ()
- JSX sample tests


## 0.50.1

- Yarn 2


## 0.41.1

- TypeScript 3.8.2
- Extend Babel plugins with latest TS features


## 0.40.1

- Remove `@polkadot/dev-react`, combine into `@polkadot/dev`
- Move all user-facing (non-CI scripts) to JS, which makes cross-platform easier
- Add `polkadot-dev-circular` script to extract circular deps


## 0.34.1

- Bump deps


## 0.33.1

- Package scoping checks, build & pre-publish
- Allow `.skip-{npm,build}` files to control build
- Bump deps


## 0.32.1

- GitHub workflows
- Don't publish this package as beta
- Bump deps


## 0.31.1

- TypeScript eslint 2
- Bump deps


## 0.30.1

- Swap to TypeScript eslint
- Bump deps


## 0.29.1

- Split deploy & build steps
- Rename `yarn run check` to `yarn lint`
- Bump deps


## 0.28.1

- Remove `useBuiltins` from babel config (corejs)
- Bump deps


## 0.27.1

- Beta versions now publish with a `beta` tag


## 0.26.1

- Publish `<major>.<minor>.<patch>-beta.x` versions from CI. This helps a lot with the stream of versions that arrise from merging.
