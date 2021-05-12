const core = require("@actions/core");
const github = require("@actions/github");

const lintPr = require("./lint-pr");

jest.mock("@actions/github");
jest.mock("@actions/core");

const commitFixture = {
  message: "feat: some commit message",
};

// pull request data from the github context payload
const contextPrFixture = {
  number: 1,
  base: {
    user: { login: "some-owner" },
    repo: { name: "some-repo" },
  },
};

// fetched pull request
const prFixture = {
  commits: 1,
  title: commitFixture.message,
};

github.context = {
  payload: {
    pull_request: contextPrFixture,
  },
};

const githubClient = {
  pulls: {
    get: jest.fn().mockReturnValue({ data: prFixture }),
    listCommits: jest
      .fn()
      .mockReturnValue({ data: [{ commit: commitFixture }] }),
  },
};

github.getOctokit.mockReturnValue(githubClient);

describe("lintPR", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when pull request has one commit", () => {
    it("does not fail when commit message is to spec and pr title matches commit message", async () => {
      await lintPr();
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it("fetches pr commit", async () => {
      await lintPr();
      expect(githubClient.pulls.listCommits).toHaveBeenCalledTimes(1);
    });

    it("fails when commit message is not conventional", async () => {
      githubClient.pulls.listCommits.mockReturnValueOnce({
        data: [{ commit: { ...commitFixture, message: "not conventional" } }],
      });

      await lintPr();
      expect(core.setFailed).toHaveBeenCalled();
    });

    it("fails when pr title does not match the commit message", async () => {
      githubClient.pulls.get.mockReturnValueOnce({
        data: { ...prFixture, title: "feat: does not match commit" },
      });

      await lintPr();
      expect(core.setFailed).toHaveBeenCalled();
    });
  });

  describe("when pull request has two or more commits", () => {
    it("does not fail when a PR title is to spec", async () => {
      githubClient.pulls.get.mockReturnValueOnce({
        data: { ...prFixture, commits: 2 },
      });

      await lintPr();
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it("does not fail when a commit message is not conventional", async () => {
      githubClient.pulls.listCommits.mockReturnValueOnce({
        data: [{ commit: { ...commitFixture, message: "not conventional" } }],
      });
      githubClient.pulls.get.mockReturnValueOnce({
        data: { ...prFixture, commits: 2 },
      });

      await lintPr();
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it("fails when the PR title is not  conventional", async () => {
      githubClient.pulls.get.mockReturnValueOnce({
        data: { ...prFixture, commits: 2, title: "not conventional" },
      });

      await lintPr();
      expect(core.setFailed).toHaveBeenCalled();
    });
  });

  it("fails when contextual pull request is not found", async () => {
    // TODO: contextual pull request test
  });
});