Promise = require "bluebird"
rubycritic_json = require "./../fixtures/rubycritic-json"

setup = (vile) ->
  vile.spawn.returns new Promise (resolve) ->
    resolve(JSON.stringify rubycritic_json)

issues = [
  {
    path: "config/routes.rb",
    type: "churn",
    churn: 19,
    signature: "rubycritic::FileChurn"
  }
  {
    path: "config/routes.rb",
    type: "complexity",
    complexity: 40,
    signature: "rubycritic::FileComplexity"
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "maintainability",
    title: "Project#generate_warnings_insight",
    message: "calls insight.project 2 times",
    signature: "rubycritic::DuplicateMethodCall" +
                "::Project#generate_warnings_insight",
    where: { start: { line: 22 } }
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "maintainability",
    title: "Project#generate_errors_insight",
    message: "has approx 6 statements",
    signature: "rubycritic::TooManyStatements" +
                "::Project#generate_errors_insight",
    where: { start: { line: 23 } }
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "maintainability",
    title: "Project#feed",
    message: "refers to list more than self" +
            " (maybe move it to another class?)",
    signature: "rubycritic::FeatureEnvy::Project#feed",
    where: { start: { line: 19 } }
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "duplicate",
    title: "Similar code",
    message: "found in 2 nodes",
    duplicate: {
      locations: [
        {
          path: "spec/models/auth_token_spec.rb",
          where: start: { line: 59 }
        }
        {
          path: "spec/models/circle_ci_integration_spec.rb",
          where: start: { line: 10 }
        }
      ],
    }
    signature: "rubycritic::DuplicateCode::" +
                "spec/models/auth_token_spec.rb," +
                "spec/models/circle_ci_integration_spec.rb"
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "maintainability",
    title: "describe(when a name is not present)::it#is invalid",
    message: "has a flog score of 26",
    where: { start: { line: 13 } },
    signature: "rubycritic::HighComplexity::" +
                "describe(when a name is not present)::it#is invalid"
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "maintainability",
    title: "describe(when a name is not present)::it#is invalid",
    message: "has a flog score of 89",
    where: { start: { line: 13 } },
    signature: "rubycritic::VeryHighComplexity::" +
                "describe(when a name is not present)::it#is invalid"
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "churn",
    churn: 1,
    signature: "rubycritic::FileChurn"
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "complexity",
    complexity: 70,
    signature: "rubycritic::FileComplexity"
  }
  {
    path: "spec/models/integration_spec.rb",
    type: "maintainability",
    title: "Rating is too low (C < A)",
    message: "Rating is too low (C < A)",
    signature: "rubycritic::Rating::C"
  }
]

module.exports =
  issues: issues
  setup: setup
