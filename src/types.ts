export interface GithubRepository {
  name: string;
  stargazers_count: number;
  full_name: string;
  forks_count: number;
  contributors: number;
}

export interface GithubSearch {
  total_count: number;
  items: object[] | GithubRepository[];
  incomplete_results: boolean;
}

export interface GithubResponse {
  data: object | object[] | GithubRepository | GithubSearch;
  link: string;
}

export interface RepoResult {
  name: string;
  stars: number;
  forks: number;
  contributors: number;
  stupidity: number;
}

export interface LanguageResult {
  language: string;
  repos: RepoResult[];
}

export declare const getRepoInfo: (repo: string) => Promise<GithubRepository>;
export declare const calculateRepoStupidity: (repo: string) => Promise<object>;
export declare const calculateLanguageStupidity: (
  language: string
) => Promise<object>;
