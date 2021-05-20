const core = require("@actions/core");
const github = require("@actions/github");

const { lintPR } = require("./lint-pr.js");
const getActionConfig = require("./action-config.js");
const actionMessage = require("./action-message.js");
const actionConfigFixture = require("./fixtures/action-config.js");

jest.mock("@actions/github");
jest.mock("@actions/core");
jest.mock("./action-config.js");

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

getActionConfig.mockImplementation(() => actionConfigFixture);

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
    describe("when COMMIT_TITLE_MATCH is true", () => {
      it("fails when pr title does not match the commit message", async () => {
        githubClient.pulls.get.mockReturnValueOnce({
          data: { ...prFixture, title: "feat: does not match commit" },
        });

        await lintPR();
        expect(core.setFailed).toHaveBeenCalledWith(
          actionMessage.fail.commit.commit_title_match
        );
      });
    });

    describe("when COMMIT_TITLE_MATCH is false", () => {
      it("passes when pr title does not match the commit message", async () => {
        getActionConfig.mockReturnValueOnce({
          ...actionConfigFixture,
          COMMIT_TITLE_MATCH: false,
        });
        githubClient.pulls.get.mockReturnValueOnce({
          data: { ...prFixture, title: "feat: does not match commit" },
        });

        await lintPR();
        expect(core.setFailed).not.toHaveBeenCalled();
      });
    });

    it("does not fail when commit message is to spec and pr title matches commit message", async () => {
      await lintPR();
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it("fetches pr commit", async () => {
      await lintPR();
      expect(githubClient.pulls.listCommits).toHaveBeenCalledTimes(1);
    });

    it("fails when commit message is not conventional", async () => {
      githubClient.pulls.listCommits.mockReturnValueOnce({
        data: [{ commit: { ...commitFixture, message: "not conventional" } }],
      });

      await lintPR();
      expect(core.setFailed).toHaveBeenCalledWith(
        actionMessage.fail.commit.lint
      );
    });
  });

  describe("when pull request has two or more commits", () => {
    it("does not fail when a PR title is to spec", async () => {
      githubClient.pulls.get.mockReturnValueOnce({
        data: { ...prFixture, commits: 2 },
      });

      await lintPR();
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it("does not fail when a commit message is not conventional", async () => {
      githubClient.pulls.listCommits.mockReturnValueOnce({
        data: [{ commit: { ...commitFixture, message: "not conventional" } }],
      });
      githubClient.pulls.get.mockReturnValueOnce({
        data: { ...prFixture, commits: 2 },
      });

      await lintPR();
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it("fails when the PR title is not conventional", async () => {
      githubClient.pulls.get.mockReturnValueOnce({
        data: { ...prFixture, commits: 2, title: "not conventional" },
      });

      await lintPR();
      expect(core.setFailed).toHaveBeenCalledWith(
        actionMessage.fail.pull_request.lint
      );
    });
  });

  it("fails when contextual pull request is not found", async () => {
    // TODO: contextual pull request test
  });
});
