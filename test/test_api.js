var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
var mocha = require("mocha");

var api = require("../api");

chai.use(chaiAsPromised);

const RATE_LIMITED = "API rate limit exceeded. Please try again later.";

describe("api", function() {
    describe("#getRepoInfo", function() {
        it("should fail for invalid repos", function() {
            return expect(api.getRepoInfo("james9909/githuub-stupidity")).to.be.rejectedWith(Error);
        });

        it("should work on valid repos", function() {
            return api.getRepoInfo("james9909/github-stupidity").then(function(data) {
                expect(data["name"]).to.equal("github-stupidity");
                expect(data["full_name"]).to.equal("james9909/github-stupidity");
                expect(data["stargazers_count"]).to.be.a("number");
                expect(data["forks_count"]).to.be.a("number");
                expect(data["contributors"]).to.be.a("number");
            });
        });
    });

    describe("#calculateRepoStupidity", function() {
        it("should fail for invalid repos", function() {
            return expect(api.calculateRepoStupidity("james9909/githuub-stupidity")).to.be.rejectedWith(Error);
        });

        it("should work on valid repos", function() {
            return api.calculateRepoStupidity("james9909/github-stupidity").then(function(data) {
                var name = data["name"];
                var stars = data["stars"];
                var forks = data["forks"];
                var contributors = data["contributors"];
                var stupidity = data["stupidity"];
                expect(name).to.equal("james9909/github-stupidity");
                expect(stars).to.be.a("number");
                expect(forks).to.be.a("number");
                expect(contributors).to.be.a("number");
                expect(stupidity).to.be.a("number");
                expect(stupidity).to.be.finite;
                expect(stupidity).to.be.at.least(0);
            });
        });
    });

    describe("#calculateLanguageStupidity", function() {
        it("should fail for invalid languages", function() {
            return expect(api.calculateLanguageStupidity("invalidlang")).to.be.rejectedWith(Error);
        });

        it("should work on valid languages", function() {
            this.timeout(8000);
            return api.calculateLanguageStupidity("javascript").then(function(data) {
                expect(data.length).to.equal(20);
            })
        })
    })
});
