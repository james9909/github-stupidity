var request = require("request");
var rp = require("request-promise");
require("dotenv").config({silent: true});

if (typeof process.env.CLIENT_ID === "undefined") {
    console.log("[*] Client ID not set.");
    return;
}

if (typeof process.env.CLIENT_SECRET === "undefined") {
    console.log("[*] Client secret not set.");
    return;
}

/*
 * Get the last page number of a paginated request.
 * Used to determine how many pages of contributors to request.
 */
function getLastLink(header) {
    var regex = /page=(\d+)>; rel="last"/;

    var match = regex.exec(header);
    if (match) {
        return match[1];
    }
    return 0;
}

/*
 * Make an api call to the GitHub api.
 */
function ghAPICall(url) {
    if (url.indexOf("?") === -1) {
        url += "?client_id=" + process.env.CLIENT_ID + "&client_secret=" + process.env.CLIENT_SECRET;
    } else {
        url += "&client_id=" + process.env.CLIENT_ID + "&client_secret=" + process.env.CLIENT_SECRET;
    }

    return new Promise(function(resolve, reject) {
        rp({
            url: "https://api.github.com" + url,
            json: true,
            headers: {
                "User-Agent": "github-stupidity"
            },
            resolveWithFullResponse: true
        }).then(function(res) {
            return resolve({body: res.body, link: res.headers.link});
        }).catch(function(err) {
            if (err.statusCode == 401) {
                return reject(new Error("Bad credentials."));
            } else if (err.statusCode === 403) {
                return reject(new Error("API rate limit exceeded. Please try again later."));
            } else if (err.statusCode === 404) {
                return reject(new Error("Repository not found."));
            } else if (err.statusCode === 422) {
                return reject(new Error("Invalid field."));
            } else {
                return reject(new Error("Failed to make api request."));
            }
        });
    });
}

/*
 * Get the number of users who contributed to a repository.
 */
function getContributors(repo) {
    return new Promise(function(resolve, reject) {
        ghAPICall("/repos/" + repo + "/contributors").then(function(res) {
            var data = res.body;
            var urls = [];
            var last = getLastLink(res.link);
            var contributors = data.length;

            if (last == 0) {
                return resolve(contributors);
            }

            for (var i=2; i <= last; i++) {
                urls.push("/repos/" + repo + "/contributors?page=" + i);
            }

            Promise.all(urls.map(ghAPICall)).then(function(res) {
                contributors += res.length;
                return resolve(contributors);
            });
        }, function(err) {
            return reject(err);
        });
    });
}

/*
 * Get basic information about a repository, including stars, forks,
 * and number of contributors.
 */
function getRepoInfo(repo) {
    return new Promise(function(resolve, reject) {
        ghAPICall("/repos/" + repo).then(function(result) {
            getContributors(repo).then(function(contributors) {
                var ret = result.body;
                ret["contributors"] = contributors;
                return resolve(ret);
            }, function(err) {
                return reject(err);
            });
        }, function(err) {
            return reject(err);
        });
    });
}

/*
 * Calculate the stupidity of a repository.
 */
function calculateRepoStupidity(repo) {
    return new Promise(function(resolve, reject) {
        getRepoInfo(repo).then(function(data) {
            var name = data["full_name"]
            var stars = data["stargazers_count"];
            var forks = data["forks_count"];
            var contributors = data["contributors"];
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
            };
            return resolve(data);
        }, function(err) {
            return reject(err);
        });
    });
}

/*
 * Calculate the stupidity of a language
 */
function calculateLanguageStupidity(language) {
    return new Promise(function(resolve, reject) {
        ghAPICall("/search/repositories?q=+language:" + language + "&sort=stars&order=desc&per_page=20").then(function(data) {

            var urls = [];
            var repos = data.body["items"];
            if (repos.length === 0) {
                return reject(new Error("No repositories found."));
            }

            // Get repo urls
            for (repo in repos) {
                urls.push(repos[repo]["full_name"]);
            }

            // Calculate the stupidity of all repositories
            Promise.all(urls.map(calculateRepoStupidity)).then(function(data) {
                var res = {
                    language: language,
                    repos: data
                };
                return resolve(res);
            }, function(err) {
                return reject(err);
            });
        }, function(err) {
            return reject(err);
        });
    });
}

module.exports.calculateRepoStupidity = calculateRepoStupidity;
module.exports.calculateLanguageStupidity = calculateLanguageStupidity;
module.exports.getRepoInfo = getRepoInfo;
