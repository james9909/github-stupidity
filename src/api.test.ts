import {
  getRepoInfo,
  calculateRepoStupidity,
  calculateLanguageStupidity
} from "./api";
import { GithubRepository, RepoResult, LanguageResult } from "./types";

describe("api", () => {
  describe("getRepoInfo()", () => {
    it("should fail for invalid repos", function() {
      expect(getRepoInfo("james9909/githuub-stupidity")).rejects.toThrow();
    });

    it("should work on valid repos", function() {
      getRepoInfo("james9909/github-stupidity").then(
        (data: GithubRepository) => {
          expect(data.name).toEqual("github-stupidity");
          expect(data.full_name).toEqual("james9909/github-stupidity");
          expect(data.stargazers_count).toBeGreaterThanOrEqual(0);
          expect(data.forks_count).toBeGreaterThanOrEqual(0);
          expect(data.contributors).toBeGreaterThan(0);
        }
      );
    });
  });

  describe("#calculateRepoStupidity", () => {
    it("should fail for invalid repos", () => {
      expect(
        calculateRepoStupidity("james9909/githuub-stupidity")
      ).rejects.toThrow();
    });

    it("should work on valid repos", () => {
      calculateRepoStupidity("james9909/github-stupidity").then(
        (data: RepoResult) => {
          const { name, stars, forks, contributors, stupidity } = data;
          expect(name).toEqual("james9909/github-stupidity");
          expect(stars).toBeGreaterThanOrEqual(0);
          expect(forks).toBeGreaterThanOrEqual(0);
          expect(contributors).toBeGreaterThan(0);
          expect(stupidity).toBeGreaterThanOrEqual(0);
          expect(stupidity).toBeLessThanOrEqual(100);
        }
      );
    });
  });

  describe("#calculateLanguageStupidity", () => {
    it("should fail for invalid languages", () => {
      expect(calculateLanguageStupidity("invalidlang")).rejects.toThrow();
    });

    it("should work on valid languages", () => {
      calculateLanguageStupidity("javascript").then((data: LanguageResult) => {
        expect(data.language).toEqual("javascript");
        expect(data.repos.length).toEqual(20);
      });
    });
  });
});
