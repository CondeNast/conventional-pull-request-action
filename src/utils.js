const getActionConfig = () => {
  let COMMIT_TITLE_MATCH = true;
  let IGNORE_COMMITS = false;
  try {
    const ctmVal = JSON.parse(process.env.INPUT_COMMITTITLEMATCH.trim());
    const ignoreCommitsVal = JSON.parse(process.env.INPUT_IGNORECOMMITS.trim());
    COMMIT_TITLE_MATCH =
      ctmVal === true || ctmVal === false ? ctmVal : COMMIT_TITLE_MATCH;
    IGNORE_COMMITS =
      ignoreCommitsVal === true || ignoreCommitsVal === false ? ignoreCommitsVal : IGNORE_COMMITS;
  } catch (_) {
    // ignore json parse error
  }

  return {
    COMMIT_TITLE_MATCH,
    IGNORE_COMMITS,
    RULES_PATH: process.env.INPUT_COMMITLINTRULESPATH,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE,
  };
};

const getCommitSubject = (commitMessage = "") => commitMessage.split("\n")[0];

module.exports = {
  getActionConfig,
  getCommitSubject,
};
