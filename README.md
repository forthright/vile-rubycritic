# vile-rubycritic [![Circle CI](https://circleci.com/gh/forthright/vile-rubycritic.svg?style=shield&circle-token=61a8841f037b8768d87856aef807feb441557a58)](https://circleci.com/gh/forthright/vile-rubycritic) [![Build status](https://ci.appveyor.com/api/projects/status/lmt7hdfluqp60cw3/branch/master?svg=true)](https://ci.appveyor.com/project/brentlintner/vile-rubycritic/branch/master) [![score-badge](https://vile.io/api/v0/projects/vile-rubycritic/badges/score?token=USryyHar5xQs7cBjNUdZ)](https://vile.io/~brentlintner/vile-rubycritic) [![coverage-badge](https://vile.io/api/v0/projects/vile-rubycritic/badges/coverage?token=USryyHar5xQs7cBjNUdZ)](https://vile.io/~brentlintner/vile-rubycritic) [![dependency-badge](https://vile.io/api/v0/projects/vile-rubycritic/badges/dependency?token=USryyHar5xQs7cBjNUdZ)](https://vile.io/~brentlintner/vile-rubycritic)

A [Vile](https://vile.io) plugin for linting your Ruby code, identifying
similar methods, and calculating code churn (via [RubyCritic](https://github.com/whitesmith/rubycritic)).

## Requirements

- [Node.js](http://nodejs.org)
- [Ruby](http://ruby-lang.org)

## Installation

Currently, you need to have `rubycritic` installed manually.

Example:

    npm i -D vile vile-rubycritic
    gem install rubycritic

Note: A good strategy is to use [Bundler](http://bundler.io).

## Config

Example:

```yaml
rubycritic:
  allow:
    - app
    - spec
  config:
    rating: "A"
```

Any source control related properites like `churn` will be ignored
if you are not using anything like Git.

### Ignore

Since `rubycritic` honours your `.reek` configuration, you should be able
to use that to ignore files.

However, it appears that ignoring files is not wholistically supported,
so a solution for now is to specify whitelist paths:

```yaml
rubycritic:
  allow:
    - app
    - lib
```

## Gotchas

If you see something like this:

```sh
error worker Error: ENOENT: no such file or directory, open './tmp/rubycritic/report.json'
```

...and you are using the [slim-lint](https://github.com/forthright/slim-lint) plugin, see [here](https://github.com/forthright/vile-slim-lint#gotchas) for some workarounds.

If nothing helps, feel free to [open an issue](https://github.com/forthright/vile-rubycritic/issues)!

## Vile Types Generated

* `vile.DUPE`
* `vile.CHURN`
* `vile.COMP`
* `vile.MAIN`

## Versioning

This project uses [Semver](http://semver.org).

## Licensing

This project is licensed under the [MPL-2.0](LICENSE) license.

Any contributions made to this project are made under the current license.

## Contributions

Current list of [Contributors](https://github.com/forthright/vile-rubycritic/graphs/contributors).

Any contributions are welcome and appreciated!

All you need to do is submit a [Pull Request](https://github.com/forthright/vile-rubycritic/pulls).

1. Please consider tests and code quality before submitting.
2. Please try to keep commits clean, atomic and well explained (for others).

### Issues

Current issue tracker is on [GitHub](https://github.com/forthright/vile-rubycritic/issues).

Even if you are uncomfortable with code, an issue or question is welcome.

### Code Of Conduct

By participating in this project you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

### Maintainers

- Brent Lintner - [@brentlintner](http://github.com/brentlintner)

## Architecture

This project is currently written in `TypeScript`.

RubyCritic provides a JSON CLI output that is currently used
until a more ideal IPC option is implemented.

- `bin` houses any shell based scripts
- `src` typescript src
- `lib` generated js library

## Developing

    cd vile-rubycritic
    npm install
    gem install rubycritic
    npm run dev
    npm test
