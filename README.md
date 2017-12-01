![isc](https://img.shields.io/badge/license-ISC-lightgrey.svg?style=flat-square)
[![style](https://img.shields.io/badge/code%20style-semistandard-lightgrey.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![npm](https://img.shields.io/npm/v/@polkadot/dev.svg?style=flat-square)](https://www.npmjs.com/package/@polkadot/dev)
[![travis](https://img.shields.io/travis/polkadot-js/dev.svg?style=flat-square)](https://travis-ci.org/polkadot-js/dev)
[![greenkeeper](https://img.shields.io/badge/greenkeeper-enabled-brightgreen.svg?style=flat-square)](https://greenkeeper.io/)
[![dependency](https://img.shields.io/david/polkadot-js/dev.svg?style=flat-square)](https://david-dm.org/polkadot-js/dev)
[![devDependency](https://img.shields.io/david/dev/polkadot-js/dev.svg?style=flat-square)](https://david-dm.org/polkadot-js/dev#info=devDependencies)

# @polkadot/dev

A collection of shared CI scripts and development environment (configuration, dependencies) used by [@polkadot](https://polkadot.js.org) projects. Included here -

- [style config](config/) Common configurations for [Babel](https://babeljs.io/), [ESLint](https://eslint.org/), [Jest](https://facebook.github.io/jest/) & [Stylelint](https://stylelint.io/).
- [flow definitions](flow-typed/) A collection of 3rd-party [flow](https://flow.org/) definitions used by libraries and projects.
- [build scripts](scripts/) Build scripts that take care of generating documentation, publishing to npm and other common tasks.
- [config skeleton](skeleton/) Standard configurations that allow for project bootstrap, done via `yarn polkadot-dev-copy-skeleton`
