const getActionConfig = require("./action-config.js");

describe("lint-rules", () => {
  beforeEach(() => {
    process.env.INPUT_COMMITTITLEMATCH = "true";
    process.env.INPUT_COMMITLINTRULESPATH = "./commitlint.rules.js";
    process.env.GITHUB_TOKEN = "asdf";
    process.env.GITHUB_WORKSPACE = "./";
  });

  describe("when parsing COMMIT_TITLE_MATCH boolean", () => {
    it("casts string to boolean", () => {
      const { COMMIT_TITLE_MATCH } = getActionConfig();

      expect(COMMIT_TITLE_MATCH).toEqual(true);
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
      RULES_PATH: expect.any(String),
      GITHUB_TOKEN: expect.any(String),
      GITHUB_WORKSPACE: expect.any(String),
    });
  });
});
