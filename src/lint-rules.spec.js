const core = require("@actions/core");

const getLintRules = require("./lint-rules.js");
const actionMessage = require("./action-message.js");
const actionConfigFixture = require("./fixtures/action-config.js");
const rulesFixture = require("./fixtures/commitlint.rules.js");

jest.mock("@actions/core");
jest.mock("@commitlint/config-conventional", () => ({
  rules: {
    "some-overriden-rule": [2, "always", "some-value"],
    "only-config-conventional-rule": [
      1,
      "always",
      "this rule is not defined in a rules module",
    ],
  },
}));

describe("lint-rules", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("warns when RULES_PATH is set without github checkout action", async () => {
    await getLintRules({
      ...actionConfigFixture,
      GITHUB_WORKSPACE: undefined,
      RULES_PATH: "./fixtures/commitlint.rules.js",
    });

    expect(core.warning).toHaveBeenCalledWith(
      actionMessage.warning.action.checkout
    );
  });

  it("warns if rules module is not found", async () => {
    await getLintRules({
      ...actionConfigFixture,
      GITHUB_WORKSPACE: "./",
      RULES_PATH: "/invalid/path/to/rules",
    });

    expect(core.warning).toHaveBeenCalledWith(
      actionMessage.warning.action.rules_not_found
    );
  });

  it("overrides config-conventional rules with lint rules in rules module", async () => {
    const rules = await getLintRules({
      ...actionConfigFixture,
      GITHUB_WORKSPACE: "./",
      RULES_PATH: "./src/fixtures/commitlint.rules.js",
    });

    expect(core.warning).not.toHaveBeenCalled();
    expect(rules["some-overriden-rule"]).toEqual(
      rulesFixture.rules["some-overriden-rule"]
    );
  });

  it("applies config conventional rules and rules module rules", async () => {
    const rules = await getLintRules({
      ...actionConfigFixture,
      GITHUB_WORKSPACE: "./",
      RULES_PATH: "./src/fixtures/commitlint.rules.js",
    });

    expect(core.warning).not.toHaveBeenCalled();
    expect(rules).toMatchObject({
      "only-config-conventional-rule": expect.any(Array),
      "only-rules-module-rule": expect.any(Array),
      "some-overriden-rule": expect.any(Array),
    });
  });
});
