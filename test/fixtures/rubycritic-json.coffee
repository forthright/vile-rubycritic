module.exports = {
  analysed_modules: [
    {
      name: "LimitedData",
      path: "config/data.rb",
      committed_at: "2016-01-15 23:52:59 -0500"
    }
    {
      name: "Routes",
      path: "config/routes.rb",
      smells: [],
      churn: 19,
      committed_at: "2016-01-15 23:52:59 -0500",
      complexity: 40,
      duplication: 0,
      methods_count: 0,
      cost: 1,
      rating: "A"
    }
    {
      name: "IntegrationSpec",
      path: "spec/models/integration_spec.rb",
      churn: 1,
      committed_at: "2015-12-07 23:02:03 -0500",
      complexity: 70,
      duplication: 56,
      methods_count: 0,
      cost: 7,
      rating: "C",
      smells: [
        {
          context: "Project#generate_warnings_insight",
          cost: 0,
          locations: [
            { path: "spec/models/integration_spec.rb", line: 22 },
            { path: "spec/models/integration_spec.rb", line: 23 }
          ],
          message: "calls insight.project 2 times",
          score: null,
          status: "old",
          type: "DuplicateMethodCall"
        },
        {
          context: "Project#generate_errors_insight",
          cost: 0,
          locations: [
            { path: "spec/models/integration_spec.rb", line: 23 },
            { path: "spec/models/integration_spec.rb", line: 24 },
            { path: "spec/models/integration_spec.rb", line: 25 },
            { path: "spec/models/integration_spec.rb", line: 26 },
            { path: "spec/models/integration_spec.rb", line: 27 },
            { path: "spec/models/integration_spec.rb", line: 28 }
          ],
          message: "has approx 6 statements",
          score: null,
          status: "old",
          type: "TooManyStatements"
        },
        {
          context: "Project#feed",
          cost: 0,
          locations: [ { path: "spec/models/integration_spec.rb", line: 19 } ],
          message: "refers to list more than self" +
                  " (maybe move it to another class?)",
          score: null,
          status: "old",
          type: "FeatureEnvy"
        },
        {
          context: "Similar code",
          cost: 5,
          locations: [
            { path: "spec/models/auth_token_spec.rb", line: 59 },
            { path: "spec/models/circle_ci_integration_spec.rb", line: 10 }
          ],
          message: "found in 2 nodes",
          score: 140,
          status: "old",
          type: "DuplicateCode"
        }
        {
          context: "describe(when a name is not present)::it#is invalid",
          cost: 0,
          locations: [ { path: "spec/models/integration_spec.rb", line: 13 } ],
          message: "has a flog score of 26",
          score: 26,
          status: null,
          type: "HighComplexity"
        }
        {
          context: "describe(when a name is not present)::it#is invalid",
          cost: 0,
          locations: [ { path: "spec/models/integration_spec.rb", line: 13 } ],
          message: "has a flog score of 89",
          score: 89,
          status: null,
          type: "VeryHighComplexity"
        }
      ]
    }
  ]
}
