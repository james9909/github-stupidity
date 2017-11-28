var request = require("request");
require("dotenv").config({silent: true});

if (typeof process.env.CLIENT_ID === "undefined") {
    console.log("[*] Client ID not set.");
    return;
}

if (typeof process.env.CLIENT_SECRET === "undefined") {
    console.log("[*] Client secret not set.");
    return;
}

function getLastLink(header) {
    var regex = /page=(\d+)>; rel="last"/;

    var match = regex.exec(header);
    if (match) {
        return match[1];
    }
    return 0;
}

function ghAPICall(url, callback) {
    if (url.indexOf("?") === -1) {
        url += "?client_id=" + process.env.CLIENT_ID + "&client_secret=" + process.env.CLIENT_SECRET;
    } else {
        url += "&client_id=" + process.env.CLIENT_ID + "&client_secret=" + process.env.CLIENT_SECRET;
    }

    request({
        url: "https://api.github.com" + url,
        json: true,
        headers: {
            "User-Agent": "github-stupidity"
        }
    }, function(err, res, body) {
        if (err) {
            callback(err);
        } else if (res.statusCode === 200) {
            callback(null, body, res.headers.link);
        } else if (res.statusCode == 401) {
            callback(new Error("Bad credentials."));
        } else if (res.statusCode === 403) {
            callback(new Error("API rate limit exceeded. Please try again later."));
        } else if (res.statusCode === 404) {
            callback(new Error("Repository not found."));
        } else {
            callback(new Error("Failed to make api request."));
        }
    });
}

function getRepoInfo(repo, callback) {
    ghAPICall("/repos/" + repo, function repoInfoCB(err, result, link) {
        if (err) {
            callback(err);
            return;
        }

        ghAPICall("/repos/" + repo + "/contributors", function contributorsCB(err, contributors, link) {
            if (err) {
                callback(err);
                return;
            }
            var contribUrls = [];
            var last = getLastLink(link);
            result["contributors"] = contributors.length;

            if (last === 0) {
                callback(null, result);
                return;
            }

            for (var i=2; i <= last; i++) {
                contribUrls.push("/repos/" + repo + "/contributors?page=" + i);
            }

            var counter = 0;
            for (url in contribUrls) {
                ghAPICall(contribUrls[url], function(err, contributors) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    result["contributors"] += contributors.length;
                    counter++;
                    if (counter === contribUrls.length) {
                        callback(null, result);
                    }
                });
            }
        });
    });
}

function calculateRepoStupidity(repo, callback) {
    getRepoInfo(repo, function(err, result) {
        if (err) {
            callback(err);
            return;
        }

        var name = result["full_name"]
        var stars = result["stargazers_count"];
        var forks = result["forks_count"];
        var contributors = result["contributors"];
        var stupidity;
        if (stars === 0) {
            stupidity = 0;
        } else {
            stupidity = (((forks - contributors) / stars) * 100);
        }
        stupidity = stupidity.toFixed(2);

        if (stupidity < 0) {
            stupidity = 0;
        }
        var data = {
            name: name,
            stars: stars,
            forks: forks,
            contributors: contributors,
            stupidity: stupidity
        }
        callback(null, data);
    });
}

function calculateLanguageStupidity(language, callback) {
    var callback_data = {
        language: language,
        repos: []
    };

    ghAPICall("/search/repositories?q=+language:" + language + "&sort=stars&order=desc&per_page=20", function(err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (result === null) {
            callback(new Error("Language not found."));
            return;
        }

        var repos = result["items"];
        if (repos.length === 0) {
            callback(new Error("No repositories found."));
            return;
        }

        var wait = repos.length;
        for (repo in repos) {
            calculateRepoStupidity(repos[repo]["full_name"], function(err, data) {
                if (err) {
                    callback(err);
                    return;
                }
                callback_data["repos"].push(data);
                if (--wait === 0) {
                    callback(null, callback_data);
                }
            });
        }
    });
}

module.exports.calculateRepoStupidity = calculateRepoStupidity;
module.exports.calculateLanguageStupidity = calculateLanguageStupidity;
module.exports.getRepoInfo = getRepoInfo;
