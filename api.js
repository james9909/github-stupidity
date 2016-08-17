var request = require("request");

function ghAPICall(url, callback) {
    request({
        url: "https://api.github.com" + url,
        json: true,
        headers: {
            "User-Agent": "github-stupidity"
        }
    }, function(err, res, body) {
        if (!err && res.statusCode === 200) {
            callback(body);
        } else if (!err && res.statusCode === 403) {
            callback("API rate limit exceeded. Please try again later.");
        } else if (!err && res.statusCode === 404) {
            callback("Repository not found.");
        } else {
            callback(err);
        }
    });
}

function getRepoInfo(repo, callback) {
    ghAPICall("/repos/" + repo, function repoInfoCB(result) {
        if (typeof result !=== "object") {
            callback(result);
            return;
        }

        ghAPICall("/repos/" + repo + "/contributors", function contributorsCB(contributors) {
            result["contributors"] = contributors.length;
            callback(result);
        });
    });
}

function calculateRepoStupidity(repo, callback) {
    getRepoInfo(repo, function(result) {
        if (typeof result !=== "object") {
            callback(result);
            return;
        }

        var stars = result["stargazers_count"];
        var forks = result["forks_count"];
        var contributors = result["contributors"];
        var stupidity = (((forks - contributors) / stars) * 100); // Yes, I'm aware that if stars == 0 then the stupidity is Infinity.
        stupidity = stupidity.toFixed(2);

        if (stupidity < 0) {
            stupidity = 0;
        }
        callback(stupidity);
    });
}

module.exports.calculateRepoStupidity = calculateRepoStupidity;
