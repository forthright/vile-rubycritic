let _ = require("lodash")
let fs = require("fs")
let path = require("path")
let vile = require("@brentlintner/vile")
let ignore = require("ignore-file")

const SOURCE_CONTROL_WARNING = "" +
  "RubyCritic can " + "provide more feedback if " +
  "you use a Git or Mercurial repository.\n?"
const DEFAULT_METHOD_COUNT_LIMIT = 15
const DEFAULT_COMPLEXITY_LIMIT = 80
const DEFAULT_CHURN_LIMIT = 15
const DEFAULT_RATING_LIMIT = "A"

let allowed = (ignore_file = []) => {
  // TODO: support windows
  let ignored = ignore_file.forEach ?
                  ignore.compile(ignore_file.join("\n")) :
                  fs.existsSync(ignore_file) ?
                    ignore.sync(ignore_file) :
                    () => false

  return (file) => {
    return file.match(/\.rb$/) && !ignored(file)
  }
}

let rubycritic = (custom_config_path, all_file_paths) => {
  let opts = {}

  // TODO: support custom ignoring (with is_not_ignored)
  opts.args = _.reduce(opts, (arr, option, name) => {
    return arr.concat([`-${name}`, option])
  }, []).concat(["-f", "json"]).concat(all_file_paths)

  return vile
    .spawn("rubycritic", opts)
    .then((stdout) => stdout ?
          JSON.parse(
            // HACK
            stdout.replace(new RegExp(SOURCE_CONTROL_WARNING), "")
          ) : { files: [] })
}

// TODO: support a churn threshold
// TODO: support a complexity threshold
// TODO: support method_count threshold
// TODO: support rating threshold
// TODO: support issue.smells as WARNING
let vile_issues = (issue, custom_conf = {}) => {
  let config = _.merge({}, custom_conf) // TODO: why read only error here?

  if (!config.method_count) config.method_count = DEFAULT_METHOD_COUNT_LIMIT
  if (!config.complexity)   config.complexity = DEFAULT_COMPLEXITY_LIMIT
  if (!config.churn)        config.churn = DEFAULT_CHURN_LIMIT
  if (!config.rating)       config.rating = DEFAULT_RATING_LIMIT

  let issues = _.flatten(_.map(issue.smells, (smell) => {
    return smell.locations.map((occurence) => {
      return vile.issue(
        vile.WARNING,
        occurence.path,
        `${smell.context} - ${smell.message} (${smell.type})`,
        { line: occurence.line }
      )
    })
  }))

  // TODO: DRY

  if (issue.churn && issue.churn > config.churn) {
    issues.push(vile.issue(
      vile.ERROR,
      issue.path,
      `Churn is too high (${issue.churn} > ${config.churn})`
    ))
  }

  if (issue.complexity && issue.complexity > config.complexity) {
    issues.push(vile.issue(
      vile.ERROR,
      issue.path,
      `Complexity is too high (${issue.complexity} > ${config.complexity})`
    ))
  }

  if (issue.method_count > config.method_count) {
    issues.push(vile.issue(
      vile.ERROR,
      issue.path,
      `Method count is too high ` +
      `(${issue.method_count} > ${config.method_count})`
    ))
  }

  if (issue.rating &&
      // a < b => true
      issue.rating.toLowerCase() > config.rating.toLowerCase()) {
    issues.push(vile.issue(
      vile.ERROR,
      issue.path,
      `Rating is too low (${issue.rating} < ${config.rating})`
    ))
  }

  return issues
}

// TODO: too complex
let punish = (plugin_data) => {
  return vile.promise_each(
    process.cwd(),
    allowed(path.join(process.cwd(), plugin_data.ignore)),
    (filepath) => vile.issue(vile.OK, filepath),
    { read_data: false }
  )
  .then((all_files) => {
    let all_file_paths = all_files.map((issue) => issue.file)
    return rubycritic(plugin_data.config, all_file_paths)
      .then((cli_json) => {
        var issues = _.get(cli_json, "analysed_modules", [])
        return _.flatten(issues.map(vile_issues))
      })
      .then((issues) => {
        return _.reject(all_files, (file) => {
          return _.any(issues, (issue) => issue.path == file)
        }).concat(issues)
      })
  })
}

module.exports = {
  punish: punish
}
