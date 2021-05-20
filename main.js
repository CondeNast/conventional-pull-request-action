const core = require("@actions/core");
const { lintPR } = require("./src/lint-pr.js");

lintPR().catch((err) => {
  core.setFailed(err.message);
  throw err;
});
