fs = require "fs"
mimus = require "mimus"
rubycritic = mimus.require "./../lib", __dirname, []
chai = require "./helpers/sinon_chai"
util = require "./helpers/util"
vile = mimus.get rubycritic, "vile"
expect = chai.expect

# TODO: write integration tests for spawn -> cli
# TODO: don't use setTimeout everywhere (for proper exception throwing)

# TODO: write system level test for rubycritic bad json output

RC_REPORT = "./tmp/rubycritic/report.json"

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
      fs.readFileAsync.reset()
      fs.readFileAsync.returns new Promise (resolve) -> resolve ""

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
      return

    it "reads the report file", (done) ->
      rubycritic
        .punish {}
        .should.be.fulfilled.notify ->
          setTimeout ->
            fs.readFileAsync.should.have.been
              .calledWith RC_REPORT
            done()
      return

    it "removes the report file", (done) ->
      rubycritic
        .punish {}
        .should.be.fulfilled.notify ->
          setTimeout ->
            fs.unlinkAsync.should.have.been
              .calledWith RC_REPORT
            done()
      return

    describe "with allow set", ->
      it "passes the allow list to the rubycritic cli", (done) ->
        rubycritic
          .punish allow: ["a", "b"]
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
        return

    describe "with ignore set", ->
      it "passes the allow list to the rubycritic cli", (done) ->
        rubycritic
          .punish allow: ["a", "b"]
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
        return
