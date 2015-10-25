# vile-rubycritic

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

Supported thresholds are applied per file.

Example:

```yml
rubycritic:
  config:
    method_count: 10
    complexity: 80
    churn: 20
    rating: "A"
```

Any source control related properites, like `churn`, will be ignored
if not run within such a context.

## Ignoring Files

If you have a `.rubycriticignore` file in your root, and you have
this in your `.vile.yml`:

```yml
rubycritic:
  ignore: .rcignore
```

### .rcignore

This is a file specific to `vile-rubycritic` itself.

It is more or less like a `.gitignore` file, and uses
[ignore-file](https://github.com/mafintosh/ignore-file) for matching.

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
