const { getActionConfig, getCommitSubject } = require("./utils.js");

describe("getActionConfig", () => {
  beforeEach(() => {
    process.env.INPUT_COMMITTITLEMATCH = "true";
    process.env.INPUT_IGNORECOMMITS = "false";
    process.env.INPUT_COMMITLINTRULESPATH = "./commitlint.rules.js";
    process.env.GITHUB_TOKEN = "asdf";
    process.env.GITHUB_WORKSPACE = "./";
  });

  describe("when parsing action config booleans", () => {
    it.each([
      ['COMMIT_TITLE_MATCH', true],
      ['IGNORE_COMMITS', false]]
    )("casts %s to boolean", (key, expected) => {
      const configValue = getActionConfig()[key];
      expect(configValue).toEqual(expected);
    });

    it("falls back to default boolean if on invalid value or parse failure", () => {
      process.env.INPUT_COMMITTITLEMATCH = "{}";
      const { COMMIT_TITLE_MATCH: ctMatchBool } = getActionConfig();
      expect(ctMatchBool).toEqual(true);

      expect(() => {
        process.env.INPUT_COMMITTITLEMATCH = "{";
        getActionConfig();
      }).not.toThrow();
    });
  });

  it("returns a valid config object", () => {
    const config = getActionConfig();
    expect(config).toMatchObject({
      COMMIT_TITLE_MATCH: expect.any(Boolean),
      IGNORE_COMMITS: expect.any(Boolean),
      RULES_PATH: expect.any(String),
      GITHUB_TOKEN: expect.any(String),
      GITHUB_WORKSPACE: expect.any(String),
    });
  });
});

describe("getCommitSubject", () => {
  const commitWithSubjectOnly = "feat(test): some commit message subject";
  const commitWithBody = `${commitWithSubjectOnly}

this is a commit message body that contains
information about this commit`;

  describe("when the commit message only contains a subject", () => {
    it("returns the commit message subject", () => {
      const subject = getCommitSubject(commitWithSubjectOnly);
      expect(subject).toEqual(commitWithSubjectOnly);
    });
  });

  describe("when the commit message contains a body", () => {
    it("returns the commit message subject only, omitting the body", () => {
      const subject = getCommitSubject(commitWithBody);
      expect(subject).toEqual(commitWithSubjectOnly);
    });
  });
});
