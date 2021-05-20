const path = require("path");

const configConventional = require("@commitlint/config-conventional");
const core = require("@actions/core");

const actionMessage = require("./action-message.js");

module.exports = async function getLintRules(actionConfig) {
  const { RULES_PATH, GITHUB_WORKSPACE } = actionConfig;

  let rules = { ...configConventional.rules };

  // if $GITHUB_WORKSPACE is not set, the checkout action has not run so we can't import the rules file
  if (RULES_PATH && !GITHUB_WORKSPACE) {
    core.warning(actionMessage.warning.action.checkout);
  } else if (RULES_PATH && GITHUB_WORKSPACE) {
    const configPath = path.resolve(GITHUB_WORKSPACE, RULES_PATH);
    try {
      /* eslint-disable-next-line global-require, import/no-dynamic-require */
      const rulesOverride = require(configPath);
      rules = { ...configConventional.rules, ...rulesOverride.rules };
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        core.warning(actionMessage.warning.action.rules_not_found);
      } else {
        throw e;
      }
    }
  }

  return rules;
};
