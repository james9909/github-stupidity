import axios, { AxiosResponse, AxiosError } from "axios";
require("dotenv").config({ silent: true });

axios.defaults.headers = {
  "User-Agent": "github-stupidity"
};

interface GithubRepository {
  stargazers_count: number;
  full_name: string;
  forks_count: number;
  contributors: number;
}

interface GithubSearch {
  total_count: number;
  items: object[] | GithubRepository[];
  incomplete_results: boolean;
}

interface GithubResponse {
  data: object | object[] | GithubRepository | GithubSearch;
  link: string;
}

/*
 * Get the last page number of a paginated request.
 * Used to determine how many pages of contributors to request.
 */
const getLastLink = (header: string): number => {
  var regex = /page=(\d+)>; rel="last"/;

  var match = regex.exec(header);
  if (match) {
    return parseInt(match[1]);
  }
  return 0;
};

/*
 * Make an api call to the GitHub api.
 */
const ghAPICall = (url: string): Promise<GithubResponse> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://api.github.com${url}`, {
        params: {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET
        }
      })
      .then((res: AxiosResponse) => {
        return resolve({ data: res.data, link: res.headers.link });
      })
      .catch((err: AxiosError) => {
        if (!err.response) {
          return;
        }

        const status = err.response.status;
        if (status == 401) {
          return reject(new Error("Bad credentials."));
        } else if (status === 403) {
          return reject(
            new Error("API rate limit exceeded. Please try again later.")
          );
        } else if (status === 404) {
          return reject(new Error("Repository not found."));
        } else if (status === 422) {
          return reject(new Error("Invalid field."));
        } else {
          return reject(new Error("Failed to make api request."));
        }
      });
  });
};

/*
 * Get the number of users who contributed to a repository.
 */
const getContributors = (repo: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ghAPICall(`/repos/${repo}/contributors`).then(
      (res: GithubResponse) => {
        const data: object[] = res.data as object[];
        const urls: string[] = [];
        const last: number = getLastLink(res.link);
        let contributors: number = data.length;

        if (last == 0) {
          return resolve(contributors);
        }

        for (let i = 2; i <= last; i++) {
          urls.push(`/repos/${repo}/contributors?page=${i}`);
        }

        const promises: Promise<GithubResponse>[] = [];
        urls.map((url: string) => {
          setTimeout(() => {
            promises.push(ghAPICall(url));
          }, 500);
        });

        Promise.all(promises).then(res => {
          contributors += res.length;
          return resolve(contributors);
        });
      },
      err => {
        return reject(err);
      }
    );
  });
};

/*
 * Get basic information about a repository, including stars, forks,
 * and number of contributors.
 */
const getRepoInfo = (repo: string): Promise<GithubRepository> => {
  return new Promise((resolve, reject) => {
    ghAPICall(`/repos/${repo}`)
      .then((result: GithubResponse) => {
        getContributors(repo)
          .then((contributors: number) => {
            const data = result.data as GithubRepository;
            return resolve({
              stargazers_count: data["stargazers_count"],
              full_name: data["full_name"],
              forks_count: data["forks_count"],
              contributors
            });
          })
          .catch(err => {
            return reject(err);
          });
      })
      .catch(err => {
        return reject(err);
      });
  });
};

/*
 * Calculate the stupidity of a repository.
 */
const calculateRepoStupidity = (repo: string): Promise<object> => {
  return new Promise((resolve, reject) => {
    getRepoInfo(repo)
      .then((data: GithubRepository) => {
        const name: string = data["full_name"] as string;
        const stars: number = data["stargazers_count"] as number;
        const forks: number = data["forks_count"] as number;
        const contributors: number = data["contributors"] as number;
        let stupidity: number;

        if (stars === 0) {
          stupidity = 0;
        } else {
          stupidity = ((forks - contributors) / stars) * 100;
        }
        if (stupidity < 0) {
          stupidity = 0;
        }

        return resolve({
          name,
          stars,
          forks,
          contributors,
          stupidity: stupidity.toFixed(2)
        });
      })
      .catch(err => {
        return reject(err);
      });
  });
};

/*
 * Calculate the stupidity of a language
 */
const calculateLanguageStupidity = (language: string): Promise<object> => {
  return new Promise((resolve, reject) => {
    ghAPICall(
      `/search/repositories?q=+language:${language}&sort=stars&order=desc&per_page=20`
    )
      .then((result: GithubResponse) => {
        let urls: string[] = [];
        const data = result.data as GithubSearch;
        const repos: GithubRepository[] = data["items"] as GithubRepository[];
        if (repos.length === 0) {
          return reject(new Error("No repositories found."));
        }

        // Get repo urls
        repos.map((repo: GithubRepository) => {
          urls.push(repo["full_name"]);
        });

        // Calculate the stupidity of all repositories
        Promise.all(urls.map(calculateRepoStupidity))
          .then(data => {
            return resolve({
              language,
              repos: data
            });
          })
          .catch(err => {
            return reject(err);
          });
      })
      .catch(err => {
        return reject(err);
      });
  });
};

module.exports.calculateRepoStupidity = calculateRepoStupidity;
module.exports.calculateLanguageStupidity = calculateLanguageStupidity;
module.exports.getRepoInfo = getRepoInfo;
