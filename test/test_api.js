var assert = require("assert");
var mocha = require("mocha");
var api = require("../api");

describe("api", function() {
    describe("#getRepoInfo", function() {
        it("should fail for invalid repos", function(done) {
            api.getRepoInfo("james9909/githuub-stupidity", function(err) {
                assert(err instanceof Error);
                done();
            });
        });

        it("should work on valid repos", function(done) {
            api.getRepoInfo("james9909/github-stupidity", function(err, data) {
                assert(err === null);
                assert(typeof data === "object");
                done();
            });
        });
    });

    describe("#calculateRepoStupidity", function() {
        it("should fail for invalid repos", function(done) {
            api.calculateRepoStupidity("james9909/githuub-stupidity", function(err) {
                assert(err instanceof Error);
                done();
            });
        });

        it("should work on valid repos", function(done) {
            api.calculateRepoStupidity("james9909/github-stupidity", function(err, data) {
                assert(err === null);
                assert(typeof data === "object");
                var stars = data.stars;
                var forks = data.forks;
                var contributors = data.contributors;
                var calculatedStupidity;
                if (stars === 0) {
                    calculatedStupidity = 0;
                } else {
                    calculatedStupidity = (((forks - contributors) / stars) * 100);
                    calculatedStupidity = calculatedStupidity.toFixed(2);
                }
                calculatedStupidity = Math.max(calculatedStupidity, 0);

                assert(data.stupidity === calculatedStupidity);
                done();
            });
        });
    });

    describe("#calculateLanguageStupidity", function() {
        it("should fail for invalid languages", function(done) {
            api.calculateLanguageStupidity("invalidlang", function(err) {
                assert(err instanceof Error);
                done();
            });
        });

        it("should work on valid languages", function(done) {
            this.timeout(8000);
            api.calculateLanguageStupidity("javascript", function(err, data) {
                assert(err === null);
                assert(typeof data === "object");
                done();
            });
        });
    });
});
