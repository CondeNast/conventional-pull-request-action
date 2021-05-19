const path = require("path");

const core = require("@actions/core");
const github = require("@actions/github");
const lint = require("@commitlint/lint").default;
const configConventional = require("@commitlint/config-conventional");

const CONFIG_PATH = process.env.INPUT_COMMITLINTCONFIGPATH;
const COMMIT_TITLE_MATCH =
  typeof process.env.INPUT_COMMITTITLEMATCH === "string"
    ? JSON.parse(process.env.INPUT_COMMITTITLEMATCH.trim())
    : true;
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE || "";

async function getLintRules() {
  const workspacePath =
    CONFIG_PATH && typeof CONFIG_PATH === "string" && GITHUB_WORKSPACE;

  let config = { ...configConventional.rules };

  // if $GITHUB_WORKSPACE is not set, the checkout action has not run so we can't import the rules file
  if (CONFIG_PATH && !GITHUB_WORKSPACE) {
    core.warn(
      "ACTION(commitlintConfigPath): actions/checkout@v2 is required to load your commitlint configuration file"
    );
  } else if (workspacePath) {
    const configPath = path.join(workspacePath, CONFIG_PATH);
    try {
      /* eslint-disable-next-line global-require, import/no-dynamic-require */
      const rulesOverride = require(configPath);
      config = { ...configConventional.rules, ...rulesOverride.rules };
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        core.warn(
          `action(commitlintConfigPath): rules module not found: ${configPath}, using default @commitlint/config-conventional lint rules`
        );
      }
    }
  }

  return config;
}

async function lintPR() {
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

  const config = await getLintRules();

  // TODO: remove this
  core.info(JSON.stringify(config));

  const parserPreset = config.parserPreset
    ? { parserOpts: config.parserPreset.parserOpts }
    : {};

  if (pullRequest.commits <= 1) {
    const {
      data: [{ commit }],
    } = await client.pulls.listCommits({
      owner,
      repo,
      pull_number,
      per_page: 1,
    });

    const commitReport = await lint(commit.message, config.rules, parserPreset);

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

    if (COMMIT_TITLE_MATCH && pullRequest.title !== commit.message) {
      core.setFailed(
        "COMMIT: PRs with a single commit require the PR title and commit message to match"
      );
    }
  } else {
    const titleReport = await lint(
      pullRequest.title,
      config.rules,
      parserPreset
    );
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
}

module.exports = {
  lintPR,
  getLintRules,
};
