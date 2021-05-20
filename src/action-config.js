module.exports = () => {
  let COMMIT_TITLE_MATCH = true;
  try {
    const ctmVal = JSON.parse(process.env.INPUT_COMMITTITLEMATCH.trim());
    COMMIT_TITLE_MATCH =
      ctmVal === true || ctmVal === false ? ctmVal : COMMIT_TITLE_MATCH;
  } catch (_) {
    // ignore json parse error
  }

  return {
    COMMIT_TITLE_MATCH,
    RULES_PATH: process.env.INPUT_COMMITLINTRULESPATH,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE,
  };
};
