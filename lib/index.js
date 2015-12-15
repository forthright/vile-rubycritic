"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var vile = require("@brentlintner/vile");
var ignore = require("ignore-file");

var SOURCE_CONTROL_WARNING = "" + "RubyCritic can " + "provide more feedback if " + "you use a Git or Mercurial repository.\n?";
var DEFAULT_METHOD_COUNT_LIMIT = 15;
var DEFAULT_COMPLEXITY_LIMIT = 80;
var DEFAULT_CHURN_LIMIT = 15;
var DEFAULT_RATING_LIMIT = "A";

var allowed = function allowed() {
  var ignore_file = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  // TODO: support windows
  var ignored = ignore_file.forEach ? ignore.compile(ignore_file.join("\n")) : fs.existsSync(ignore_file) ? ignore.sync(ignore_file) : function () {
    return false;
  };

  return function (file) {
    return file.match(/\.rb$/) && !ignored(file);
  };
};

var rubycritic = function rubycritic(custom_config_path, all_file_paths) {
  var opts = {};

  // TODO: support custom ignoring (with is_not_ignored)
  opts.args = _.reduce(opts, function (arr, option, name) {
    return arr.concat(["-" + name, option]);
  }, []).concat(["-f", "json"]).concat(all_file_paths);

  return vile.spawn("rubycritic", opts).then(function (stdout) {
    return stdout ? JSON.parse(
    // HACK
    stdout.replace(new RegExp(SOURCE_CONTROL_WARNING), "")) : { files: [] };
  });
};

// TODO: support a churn threshold
// TODO: support a complexity threshold
// TODO: support method_count threshold
// TODO: support rating threshold
// TODO: support issue.smells as WARNING
var vile_issues = function vile_issues(issue) {
  var custom_conf = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var config = _.merge({}, custom_conf); // TODO: why read only error here?

  if (!config.method_count) config.method_count = DEFAULT_METHOD_COUNT_LIMIT;
  if (!config.complexity) config.complexity = DEFAULT_COMPLEXITY_LIMIT;
  if (!config.churn) config.churn = DEFAULT_CHURN_LIMIT;
  if (!config.rating) config.rating = DEFAULT_RATING_LIMIT;

  var issues = _.flatten(_.map(issue.smells, function (smell) {
    return smell.locations.map(function (occurence) {
      return vile.issue(vile.WARNING, occurence.path, smell.context + " - " + smell.message + " (" + smell.type + ")", { line: occurence.line });
    });
  }));

  // TODO: DRY

  if (issue.churn && issue.churn > config.churn) {
    issues.push(vile.issue(vile.ERROR, issue.path, "Churn is too high (" + issue.churn + " > " + config.churn + ")"));
  }

  if (issue.complexity && issue.complexity > config.complexity) {
    issues.push(vile.issue(vile.ERROR, issue.path, "Complexity is too high (" + issue.complexity + " > " + config.complexity + ")"));
  }

  if (issue.method_count > config.method_count) {
    issues.push(vile.issue(vile.ERROR, issue.path, "Method count is too high " + ("(" + issue.method_count + " > " + config.method_count + ")")));
  }

  if (issue.rating &&
  // a < b => true
  issue.rating.toLowerCase() > config.rating.toLowerCase()) {
    issues.push(vile.issue(vile.ERROR, issue.path, "Rating is too low (" + issue.rating + " < " + config.rating + ")"));
  }

  return issues;
};

// TODO: too complex
var punish = function punish(plugin_data) {
  return vile.promise_each(process.cwd(), allowed(path.join(process.cwd(), plugin_data.ignore)), function (filepath) {
    return vile.issue(vile.OK, filepath);
  }, { read_data: false }).then(function (all_files) {
    var all_file_paths = all_files.map(function (issue) {
      return issue.file;
    });
    return rubycritic(plugin_data.config, all_file_paths).then(function (cli_json) {
      var issues = _.get(cli_json, "analysed_modules", []);
      return _.flatten(issues.map(vile_issues));
    }).then(function (issues) {
      return _.reject(all_files, function (file) {
        return _.any(issues, function (issue) {
          return issue.path == file;
        });
      }).concat(issues);
    });
  });
};

module.exports = {
  punish: punish
};