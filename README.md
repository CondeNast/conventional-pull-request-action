# conventional-pull-request
[![license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat)](LICENSE)

A github action that enforces the [conventional commit spec][0] on pull requests to ensure a clean and conventional commit history.

_Proudly built by:_

<a href="https://technology.condenast.com"><img src="https://user-images.githubusercontent.com/1215971/35070721-3f136cdc-fbac-11e7-81b4-e3aa5cc70a17.png" title="Conde Nast Technology" width=350/></a>

## Configuration

This action uses [commitlint](https://github.com/conventional-changelog/commitlint#readme) with the [config-conventional configuration][1] to ensure merge commits meet the conventional commit [spec][0].

This action lints the pull request's title, and in the case of a PR with a single commit, the commit message (see [FAQ](#faq) for details).

## Configuration

### Rule Overrides

This action supports overriding rules from [config-conventional][1](see this repo as an example):

```yml
# .github/workflows/main.yml

...
jobs:
  lint-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          # override config-conventional rules, specify a relative path to your rules module, actions/checkout is required for this setting!
          commitlintRulesPath: './commitlint.rules.js' # default: undefined
          # if the PR contains a single commit, fail if the commit message and the PR title do not match
          commitTitleMatch: 'true' # default: 'true'

        ...
```
```js
./commitlint.rules.js

module.exports = {
  rules: {
    ...
  }
}
```

> Your rules file must export an object with a `rules` field, other `commitlint` config is not supported.
> If you use `commitlint` in your git hooks, you can extend your custom rules in your [`commitlint.config.js`](commitlint.config.js) so the `commitlint` rules config is shared between your hook and this action, ex: [`commitlint.config.js`](commitlint.config.js)

```js
# ./commitlint.config.js

module.exports = {
  extends: ["@commitlint/config-conventional", "./commitlint.rules.js"],
};
```



## Contributing
[How to contribute](CONTRIBUTING.md)

### Dev
Github javascript actions require all dependencies to be checked into the codebase, so we use [ncc](https://github.com/vercel/ncc) to compile all dependencies and source code into a single file. To make changes to this action, change `main.js` and compile it:
```sh
npm run prepare
```

> Be sure to commit and push all changed files in `./dist` to see your changes to the action execute.

## FAQ

___1. Why is my commit required to conform with the [spec][0]?___

In the case of pull requests with a single commit, when a developer merges the PR, github will autofill the merge commit message with the PR's commit message, instead of the PR's title. By enforcing the [spec][0] on the single commit, the pre-populated merge commit message will conform to the [spec][0].

___2. Why must my commit message match the PR title?___

In the case of pull requests with a single commit, the commit message will be used as the merge commit message. In PRs with multiple commits, the PR title is used as the merge commit message. By enforcing a commit message/PR title match, we ensure a merge commit message will always match a PR title, no matter how many commits are included in a pull request.


## Contributors

See the list of [contributors](https://github.com/CondeNast/conventional-pull-request/contributors) who participated in writing this tool.

[0]: https://www.conventionalcommits.org/en/v1.0.0/#specification
[1]: https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional
