# npm-updated

Identify dependency version differences between two npm installs.

[![npm Version][npm-badge]][npm]
[![Build Status][build-badge]][build-status]
[![Test Coverage][coverage-badge]][coverage-result]
[![Dependency Status][dep-badge]][dep-status]

## Installation

Install using [npm][]:

    $ npm install jimf/npm-updated -g

## Usage

This script expects `./node_modules/` and `./node_modules.bak/` directories to
be present in the current working directory. Then by running the following:

    $ npm-updated

... it will show which packages were updated, if any, along with the version
differences.

## License

MIT

[build-badge]: https://img.shields.io/travis/jimf/npm-updated/master.svg
[build-status]: https://travis-ci.org/jimf/npm-updated
[npm-badge]: https://img.shields.io/npm/v/npm-updated.svg
[npm]: https://www.npmjs.org
[coverage-badge]: https://img.shields.io/coveralls/jimf/npm-updated.svg
[coverage-result]: https://coveralls.io/r/jimf/npm-updated
[dep-badge]: https://img.shields.io/david/jimf/npm-updated.svg
[dep-status]: https://david-dm.org/jimf/npm-updated
