import _  = require("lodash")
import fs = require("fs")
import Bluebird = require("bluebird")
import vile = require("vile")

const RC_REPORT = "./tmp/rubycritic/report.json"
const RC_BIN = "rubycritic"
const RC_BASE_ARGS : string[] = [ "-f", "json" ]
const DEFAULT_RATING_LIMIT = "A"

Bluebird.promisifyAll(fs)

const parse_rc_json = (
  stringified : string
) : rubycritic.JSON  =>
  _.isEmpty(stringified) ?
    { analysed_modules: [] } :
    JSON.parse(stringified)

const remove_report = () : Bluebird<void> =>
  (<any>fs).unlinkAsync(RC_REPORT)

const read_report = () : Bluebird<rubycritic.JSON> =>
  (<any>fs).readFileAsync(RC_REPORT)
    .then((data : string) =>
      remove_report().then(() =>
        parse_rc_json(data)
      ))

const rubycritic = (
  paths : vile.AllowList
) : Bluebird<rubycritic.JSON> =>
  vile
    .spawn(RC_BIN, { args: RC_BASE_ARGS.concat(paths) })
    .then(read_report)

const smell_type = (smell : rubycritic.Smell) =>
  _.get(smell, "type", "").toLowerCase()

// TODO: split up this method
const vile_issues = (
  issue : rubycritic.Issue,
  config : rubycritic.Config
) => {
  if (!config.rating) config.rating = DEFAULT_RATING_LIMIT
  let smells : rubycritic.Smell[] = _.get(issue, "smells", [])
  let issues = _.map(smells, (smell : rubycritic.Smell) => {
    if (smell_type(smell) == "duplicatecode") {

      let files : string[] = _.map(
        smell.locations,
        (loc : rubycritic.Loc) => loc.path)

      return vile.issue({
        type: vile.DUPE,
        path: issue.path,
        title: smell.context,
        message: smell.message,
        signature: `rubycritic::${smell.type}::${files.join(",")}`,
        duplicate: {
          locations: _.map(smell.locations, (loc : rubycritic.Loc) => {
            return {
              path: loc.path,
              where: { start: { line: loc.line } }
            }
          })
        }
      })
    } else {
      // HACK: just use first location for now for MAIN issues
      // TODO: parse non dupe smells more intelligently
      let location = _.first(smell.locations)
      return vile.issue({
        type: vile.MAIN,
        path: issue.path,
        title: smell.context,
        message: smell.message,
        signature: `rubycritic::${smell.type}::${smell.context}`,
        where: { start: { line: location.line } }
      })
    }
  })

  if (_.has(issue, "churn")) {
    issues.push(vile.issue({
      type: vile.CHURN,
      path: issue.path,
      churn: issue.churn,
      signature: "rubycritic::FileChurn"
    }))
  }

  if (_.has(issue, "complexity")) {
    issues.push(vile.issue({
      type: vile.COMP,
      path: issue.path,
      complexity: issue.complexity,
      signature: "rubycritic::FileComplexity"
    }))
  }

  if (_.has(issue, "rating") && _.has(config, "rating") &&
      issue.rating.toLowerCase() > config.rating.toLowerCase()) {
    issues.push(vile.issue({
      type: vile.MAIN,
      path: issue.path,
      title: `Rating is too low (${issue.rating} < ${config.rating})`,
      message: `Rating is too low (${issue.rating} < ${config.rating})`,
      signature: `rubycritic::Rating::${issue.rating}`
    }))
  }

  return issues
}

const rc_issues_by_file = (
  cli_json : rubycritic.JSON
) : rubycritic.IssuesByFile =>
  _.get(cli_json, "analysed_modules", [])

const punish = (
  plugin_data : vile.PluginConfig
) : Bluebird<vile.IssueList> => {
  let config = _.get(plugin_data, "config", {})
  let allow : vile.AllowList = _.get(plugin_data, "allow", [])
  let paths : vile.AllowList = _.isEmpty(allow) ? ["."] : allow

  return rubycritic(paths)
    .then(rc_issues_by_file)
    .then((files : rubycritic.IssuesByFile) =>
      _.flatten(files.map((issue : rubycritic.Issue) =>
        vile_issues(issue, config)
      )))
}

module.exports = {
  punish: punish
}
