# vile-rubycritic [![Circle CI](https://circleci.com/gh/forthright/vile-rubycritic.svg?style=shield&circle-token=61a8841f037b8768d87856aef807feb441557a58)](https://circleci.com/gh/forthright/vile-rubycritic) [![Build status](https://ci.appveyor.com/api/projects/status/lmt7hdfluqp60cw3/branch/master?svg=true)](https://ci.appveyor.com/project/brentlintner/vile-rubycritic/branch/master) [![score-badge](https://vile.io/api/v0/projects/vile-rubycritic/badges/score?token=USryyHar5xQs7cBjNUdZ)](https://vile.io/~brentlintner/vile-rubycritic) [![security-badge](https://vile.io/api/v0/projects/vile-rubycritic/badges/security?token=USryyHar5xQs7cBjNUdZ)](https://vile.io/~brentlintner/vile-rubycritic) [![coverage-badge](https://vile.io/api/v0/projects/vile-rubycritic/badges/coverage?token=USryyHar5xQs7cBjNUdZ)](https://vile.io/~brentlintner/vile-rubycritic) [![dependency-badge](https://vile.io/api/v0/projects/vile-rubycritic/badges/dependency?token=USryyHar5xQs7cBjNUdZ)](https://vile.io/~brentlintner/vile-rubycritic)

A [vile](https://vile.io) plugin for [rubycritic](https://github.com/whitesmith/rubycritic).

## Requirements

- [nodejs](http://nodejs.org)
- [npm](http://npmjs.org)
- [ruby](http://ruby-lang.org)
- [rubygems](http://rubygems.org)

## Installation

Currently, you need to have `rubycritic` installed manually.

Example:

    npm i -D vile vile-rubycritic
    gem install rubycritic

Note: A good strategy is to use [bundler](http://bundler.io).

## Config

`vile.MAIN` issues are generated if the below thresholds
are hit. `vile.CHURN` and `vile.COMP` are automatically
created if values are provided, as `vile.io` will notify
if you have high churn/complexity.

Example:

```yaml
rubycritic:
  allow:
    - app
    - spec
  config:
    rating: "A"
```

Any source control related properites, like `churn`, will be ignored
if not run within such a context.

## Ignoring Files

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

## Vile Types Generated

Since RubyCritic is awesome, it allows this plugin to generate a lot
of details and generates:

* `vile.DUPE`
* `vile.CHURN`
* `vile.COMP`
* `vile.MAIN`

## Versioning

This project ascribes to [semantic versioning](http://semver.org).

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

This project ascribes to [contributor-covenant.org](http://contributor-covenant.org).

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

## Hacking

    cd vile-rubycritic
    npm install
    gem install rubycritic
    npm run dev
    npm test
