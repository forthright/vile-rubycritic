let _ = require("lodash")
let fs = require("fs")
let Bluebird = require("bluebird")
let vile = require("@forthright/vile")

const RC_REPORT = "./tmp/rubycritic/report.json"
const RC_BIN = "rubycritic"
const RC_BASE_ARGS = [ "-f", "json" ]
const DEFAULT_RATING_LIMIT = "A"

Bluebird.promisifyAll(fs)

let parse_rc_json = (stringified) =>
  _.isEmpty(stringified) ?
    { analysed_modules: [] } :
    JSON.parse(stringified)

let remove_report = () =>
  fs.unlinkAsync(RC_REPORT)

let read_report = () =>
  fs.readFileAsync(RC_REPORT)
    .then((data) =>
      remove_report().then(() =>
        parse_rc_json(data)
      ))

let rubycritic = (paths) =>
  vile
    .spawn(RC_BIN, { args: RC_BASE_ARGS.concat(paths) })
    .then(read_report)

let smell_type = (smell) =>
  _.get(smell, "type", "").toLowerCase()

// TODO: split up this method
let vile_issues = (issue, config) => {
  if (!config.rating) config.rating = DEFAULT_RATING_LIMIT
  let smells = _.get(issue, "smells", [])
  let issues = _.map(smells, (smell) => {
    if (smell_type(smell) == "duplicatecode") {
      let files = _.map(smell.locations, (loc) => loc.path)
      return vile.issue({
        type: vile.DUPE,
        path: issue.path,
        title: smell.context,
        message: smell.message,
        signature: `rubycritic::${smell.type}::${files.join(",")}`,
        duplicate: {
          locations: _.map(smell.locations, (loc) => {
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

let rc_issues_by_file = (cli_json) =>
  _.get(cli_json, "analysed_modules", [])

let punish = (plugin_data) => {
  let config = _.get(plugin_data, "config", {})
  let allow = _.get(plugin_data, "allow", [])
  let paths = _.isEmpty(allow) ? ["."] : allow

  return rubycritic(paths)
    .then(rc_issues_by_file)
    .then((files) =>
      _.flatten(files.map((issue) =>
        vile_issues(issue, config)
      )))
}

module.exports = {
  punish: punish
}
