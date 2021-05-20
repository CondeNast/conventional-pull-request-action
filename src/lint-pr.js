const core = require("@actions/core");
const github = require("@actions/github");
const lint = require("@commitlint/lint").default;

const getActionConfig = require("./action-config.js");
const actionMessage = require("./action-message.js");
const getLintRules = require("./lint-rules.js");

async function lintPR() {
  const actionConfig = getActionConfig();
  const { GITHUB_TOKEN, COMMIT_TITLE_MATCH } = actionConfig;

  const client = github.getOctokit(GITHUB_TOKEN);

  if (!github.context.payload.pull_request) {
    core.setFailed(actionMessage.fail.pull_request.not_found);
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

  const lintRules = await getLintRules(actionConfig);

  if (pullRequest.commits <= 1) {
    const {
      data: [{ commit }],
    } = await client.pulls.listCommits({
      owner,
      repo,
      pull_number,
      per_page: 1,
    });

    const commitReport = await lint(commit.message, lintRules);

    commitReport.warnings.forEach((warn) =>
      core.warning(`Commit message: ${warn.message}`)
    );
    commitReport.errors.forEach((err) =>
      core.error(`Commit message: ${err.message}`)
    );

    if (!commitReport.valid) {
      core.setFailed(actionMessage.fail.commit.lint);
    }

    if (COMMIT_TITLE_MATCH && pullRequest.title !== commit.message) {
      core.setFailed(actionMessage.fail.commit.commit_title_match);
    }
  } else {
    const titleReport = await lint(pullRequest.title, lintRules);
    titleReport.warnings.forEach((warn) =>
      core.warning(`PR title: ${warn.message}`)
    );
    titleReport.errors.forEach((err) => core.error(`PR title: ${err.message}`));

    if (!titleReport.valid) {
      core.setFailed(actionMessage.fail.pull_request.lint);
    }
  }
}

module.exports = {
  lintPR,
};
