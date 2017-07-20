"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var fs = require("fs");
var Bluebird = require("bluebird");
var vile = require("vile");
var RC_REPORT = "./tmp/rubycritic/report.json";
var RC_BIN = "rubycritic";
var RC_BASE_ARGS = ["-f", "json"];
var DEFAULT_RATING_LIMIT = "A";
Bluebird.promisifyAll(fs);
var parse_rc_json = function (stringified) {
    return _.isEmpty(stringified) ?
        { analysed_modules: [] } :
        JSON.parse(stringified);
};
var remove_report = function () {
    return fs.unlinkAsync(RC_REPORT);
};
var read_report = function () {
    return fs.readFileAsync(RC_REPORT)
        .then(function (data) {
        return remove_report().then(function () {
            return parse_rc_json(data);
        });
    });
};
var rubycritic = function (paths) {
    return vile
        .spawn(RC_BIN, { args: RC_BASE_ARGS.concat(paths) })
        .then(read_report);
};
var smell_type = function (smell) {
    return _.get(smell, "type", "").toLowerCase();
};
var vile_issues = function (issue, config) {
    if (!config.rating)
        config.rating = DEFAULT_RATING_LIMIT;
    var smells = _.get(issue, "smells", []);
    var issues = _.map(smells, function (smell) {
        if (smell_type(smell) == "duplicatecode") {
            var files = _.map(smell.locations, function (loc) { return loc.path; });
            return vile.issue({
                type: vile.DUPE,
                path: issue.path,
                title: smell.context,
                message: smell.message,
                signature: "rubycritic::" + smell.type + "::" + files.join(","),
                duplicate: {
                    locations: _.map(smell.locations, function (loc) {
                        return {
                            path: loc.path,
                            where: { start: { line: loc.line } }
                        };
                    })
                }
            });
        }
        else {
            var location_1 = _.first(smell.locations);
            return vile.issue({
                type: vile.MAIN,
                path: issue.path,
                title: smell.context,
                message: smell.message,
                signature: "rubycritic::" + smell.type + "::" + smell.context,
                where: { start: { line: location_1.line } }
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
    if (_.has(issue, "rating") && _.has(config, "rating") &&
        issue.rating.toLowerCase() > config.rating.toLowerCase()) {
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
var rc_issues_by_file = function (cli_json) {
    return _.get(cli_json, "analysed_modules", []);
};
var punish = function (plugin_data) {
    var config = _.get(plugin_data, "config", {});
    var allow = _.get(plugin_data, "allow", []);
    var paths = _.isEmpty(allow) ? ["."] : allow;
    return rubycritic(paths)
        .then(rc_issues_by_file)
        .then(function (files) {
        return _.flatten(files.map(function (issue) {
            return vile_issues(issue, config);
        }));
    });
};
module.exports = {
    punish: punish
};
