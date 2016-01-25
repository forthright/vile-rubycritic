let _ = require("lodash")
let vile = require("@brentlintner/vile")

// TODO: log this as a warning if matched
const BEFORE_JSON = /^[^\{]*/gi
const AFTER_JSON = /[^\}]*$/gi
const DEFAULT_RATING_LIMIT = "A"

let santize_invalid_json_output = (stdout) =>
  stdout.replace(BEFORE_JSON, "")
        .replace(AFTER_JSON, "")

let rubycritic = (config) =>
  vile
    .spawn("rubycritic", {
      args: ["-f", "json"].concat(_.get(config, "paths", ["."]))
    })
		// HACK
    .then((stdout) => stdout ?
			JSON.parse(santize_invalid_json_output(stdout)) :
				{ analysed_modules: [] })

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
				locations: _.map(smell.locations, (loc) => {
					return {
						path: loc.path,
						where: { start: { line: loc.line } }
					}
				})
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

  if (_.has(issue, "rating") &&
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

let punish = (plugin_data) =>
  rubycritic(_.get(plugin_data, "config", {}))
    .then((cli_json) => {
			let files = _.get(cli_json, "analysed_modules", [])
			return _.flatten(files.map((issue) =>
				vile_issues(issue, _.get(plugin_data, "config", {}))
			))
		})

module.exports = {
  punish: punish
}
