const core = require("@actions/core");
const github = require("@actions/github");
const lint = require("@commitlint/lint").default;
const configConventional = require("@commitlint/config-conventional");

module.exports = async function lintPR() {
  const client = github.getOctokit(process.env.GITHUB_TOKEN);

  if (!github.context.payload.pull_request) {
    core.setFailed(
      "Pull request not found. Use pull request event to trigger this action"
    );
    return;
  }

  const {
    // eslint-disable-next-line camelcase
    number: pull_number,
    base: {
      user: { login: owner },
      repo: { name: repo },
    },
  } = github.context.payload.pull_request;

  const { data: pullRequest } = await client.pulls.get({
    owner,
    repo,
    pull_number,
  });

  if (pullRequest.commits <= 1) {
    const {
      data: [{ commit }],
    } = await client.pulls.listCommits({
      owner,
      repo,
      pull_number,
      per_page: 1,
    });

    const commitReport = await lint(commit.message, configConventional.rules);
    commitReport.warnings.forEach((warn) =>
      core.warning(`Commit message: ${warn.message}`)
    );
    commitReport.errors.forEach((err) =>
      core.error(`Commit message: ${err.message}`)
    );

    if (!commitReport.valid) {
      core.setFailed(
        "COMMIT: PRs with a single commit require the commit message to conform to the conventional commit spec"
      );
    }

    if (pullRequest.title !== commit.message) {
      core.setFailed(
        "COMMIT: PRs with a single commit require the PR title and commit message to match"
      );
    }
  } else {
    const titleReport = await lint(pullRequest.title, configConventional.rules);
    titleReport.warnings.forEach((warn) =>
      core.warning(`PR title: ${warn.message}`)
    );
    titleReport.errors.forEach((err) => core.error(`PR title: ${err.message}`));

    if (!titleReport.valid) {
      core.setFailed(
        "PULL REQUEST: PR title does not conform to the conventional commit spec"
      );
    }
  }
};
