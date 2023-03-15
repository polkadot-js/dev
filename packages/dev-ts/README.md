# @polkadot/dev-ts

This is an Node TS loader, specifically written to cater for the polkadot-js needs, aka it is meant to be used inside polkadot-js projects. It doesn't aim to be a catch-all resolver, although it does cover quite a large spectrum of functionality.

It caters for -

1. Pass through resolution and compiling of .ts & .tsx sources
2. Resolution of TS aliases
3. Resolution of .json files (alongside aliases)
4. Resolution of extensionless imports (basic, best-effort)

Usage

```
node --loader @polkadot/dev-ts ...
```
