module.exports = {
  fail: {
    commit: {
      commit_title_match:
        "COMMIT: PRs with a single commit require the PR title and commit message to match",
      lint: "COMMIT: PRs with a single commit require the commit message to conform to the conventional commit spec",
    },
    pull_request: {
      lint: "PULL REQUEST: PR title does not conform to the conventional commit spec",
      not_found:
        "Pull request not found. Use pull request event to trigger this action",
    },
  },
  warning: {
    action: {
      checkout:
        "ACTION(commitlintRulesPath): actions/checkout@v2 is required to load your commitlint rules file",
      rules_not_found:
        "ACTION(commitlintRules ): rules module not found, using default @commitlint/config-conventional lint rules...",
    },
  },
};
