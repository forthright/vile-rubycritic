mimus = require "mimus"
rubycritic = mimus.require "./../lib", __dirname, []
chai = require "./helpers/sinon_chai"
util = require "./helpers/util"
vile = mimus.get rubycritic, "vile"
expect = chai.expect

# TODO: write integration tests for spawn -> cli
# TODO: don't use setTimeout everywhere (for proper exception throwing)

# TODO: write system level test for rubycritic bad json output

describe "rubycritic", ->
  afterEach mimus.reset
  after mimus.restore
  beforeEach ->
    mimus.stub vile, "spawn"
    util.setup vile

  describe "#punish", ->
    it "converts rubycritic json to issues", ->
      rubycritic
        .punish { config: rating: "A" }
        .should.eventually.eql util.issues

    it "handles an empty response", ->
      vile.spawn.reset()
      vile.spawn.returns new Promise (resolve) -> resolve ""

      rubycritic
        .punish {}
        .should.eventually.eql []

    it "calls rubycritic in the cwd", (done) ->
      rubycritic
        .punish {}
        .should.be.fulfilled.notify ->
          setTimeout ->
            vile.spawn.should.have.been
              .calledWith "rubycritic", args: [ "-f", "json", "." ]
            done()

    describe "with custom config paths", ->
      it "passes the paths to the rubycritic cli", (done) ->
        rubycritic
          .punish config: paths: ["a", "b"]
          .should.be.fulfilled.notify ->
            setTimeout ->
              vile.spawn.should.have.been
                .calledWith "rubycritic", args: [
                              "-f"
                              "json"
                              "a"
                              "b"
                            ]
              done()
