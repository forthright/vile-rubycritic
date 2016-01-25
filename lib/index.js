"use strict";

var _ = require("lodash");
var vile = require("@brentlintner/vile");

// TODO: log this as a warning if matched
var BEFORE_JSON = /^[^\{]*/gi;
var AFTER_JSON = /[^\}]*$/gi;
var DEFAULT_RATING_LIMIT = "A";

var santize_invalid_json_output = function santize_invalid_json_output(stdout) {
  return stdout.replace(BEFORE_JSON, "").replace(AFTER_JSON, "");
};

var rubycritic = function rubycritic(config) {
  return vile.spawn("rubycritic", {
    args: ["-f", "json"].concat(_.get(config, "paths", ["."]))
  })
  // HACK
  .then(function (stdout) {
    return stdout ? JSON.parse(santize_invalid_json_output(stdout)) : { analysed_modules: [] };
  });
};

var smell_type = function smell_type(smell) {
  return _.get(smell, "type", "").toLowerCase();
};

// TODO: split up this method
var vile_issues = function vile_issues(issue, config) {
  if (!config.rating) config.rating = DEFAULT_RATING_LIMIT;
  var smells = _.get(issue, "smells", []);
  var issues = _.map(smells, function (smell) {
    if (smell_type(smell) == "duplicatecode") {
      var files = _.map(smell.locations, function (loc) {
        return loc.path;
      });
      return vile.issue({
        type: vile.DUPE,
        path: issue.path,
        title: smell.context,
        message: smell.message,
        signature: "rubycritic::" + smell.type + "::" + files.join(","),
        locations: _.map(smell.locations, function (loc) {
          return {
            path: loc.path,
            where: { start: { line: loc.line } }
          };
        })
      });
    } else {
      // HACK: just use first location for now for MAIN issues
      // TODO: parse non dupe smells more intelligently
      var _location = _.first(smell.locations);
      return vile.issue({
        type: vile.MAIN,
        path: issue.path,
        title: smell.context,
        message: smell.message,
        signature: "rubycritic::" + smell.type + "::" + smell.context,
        where: { start: { line: _location.line } }
      });
    }
  });

  if (_.has(issue, "churn")) {
    issues.push(vile.issue({
      type: vile.CHURN,
      path: issue.path,
      churn: issue.churn,
      signature: "rubycritic::FileChurn"
    }));
  }

  if (_.has(issue, "complexity")) {
    issues.push(vile.issue({
      type: vile.COMP,
      path: issue.path,
      complexity: issue.complexity,
      signature: "rubycritic::FileComplexity"
    }));
  }

  if (_.has(issue, "rating") && issue.rating.toLowerCase() > config.rating.toLowerCase()) {
    issues.push(vile.issue({
      type: vile.MAIN,
      path: issue.path,
      title: "Rating is too low (" + issue.rating + " < " + config.rating + ")",
      message: "Rating is too low (" + issue.rating + " < " + config.rating + ")",
      signature: "rubycritic::Rating::" + issue.rating
    }));
  }

  return issues;
};

var punish = function punish(plugin_data) {
  return rubycritic(_.get(plugin_data, "config", {})).then(function (cli_json) {
    var files = _.get(cli_json, "analysed_modules", []);
    return _.flatten(files.map(function (issue) {
      return vile_issues(issue, _.get(plugin_data, "config", {}));
    }));
  });
};

module.exports = {
  punish: punish
};