# vile-rubycritic [![Circle CI](https://circleci.com/gh/brentlintner/vile-rubycritic.svg?style=svg&circle-token=61a8841f037b8768d87856aef807feb441557a58)](https://circleci.com/gh/brentlintner/vile-rubycritic)

A [vile](http://github.com/brentlintner/vile) plugin for
[rubycritic](https://github.com/whitesmith/rubycritic).

## Requirements

- [nodejs](http://nodejs.org)
- [npm](http://npmjs.org)
- [ruby](http://ruby-lang.org)
- [rubygems](http://rubygems.org)

## Installation

Currently, you need to have `rubycritic` installed manually.

Example:

    npm i vile-rubycritic
    gem install rubycritic

Note: A good strategy is to use [bundler](http://bundler.io).

## Config

`vile.MAIN` issues are generated if the below thresholds
are hit. `vile.CHURN` and `vile.COMP` are automatically
created if values are provided, as `vile.io` will notify
if you have high churn/complexity.

Example:

```yml
rubycritic:
  config:
    method_count: 10
    rating: "A"
```

Any source control related properites, like `churn`, will be ignored
if not run within such a context.

## Ignoring Files

Since `rubycritic` honours your `.reek` configuration, you should be able
to use that to ignore files.

However, it appears that ignoring files is not wholistically supported
and/or buggy, so a solution for now is to specify whitelist paths:

```yml
rubycritic:
  config:
    paths: [ "app", "lib" ]
```

## Architecture

This project is currently written in JavaScript. RubyCritic provides
a JSON CLI output that is currently used until a more ideal
IPC option is implemented.

- `bin` houses any shell based scripts
- `src` is es6+ syntax compiled with [babel](https://babeljs.io)
- `lib` generated js library

## Hacking

    cd vile-rubycritic
    npm install
    gem install rubycritic
    npm run dev
    npm test
