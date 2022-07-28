# conventional-pull-request-action

[![license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat)](LICENSE)

A github action that enforces the [conventional commit spec][0] on pull requests to ensure a clean and conventional commit history.

_Proudly built by:_

<a href="https://technology.condenast.com"><img src="https://user-images.githubusercontent.com/1215971/35070721-3f136cdc-fbac-11e7-81b4-e3aa5cc70a17.png" title="Conde Nast Technology" width=350/></a>

- [Usage](#usage)

  - [Configuration](#configuration)
  - [Rule Overrides](#rule-overrides)

- [Contributing](#contributing)
  - [Develop](#dev)
    - [Install](#install)
  - [Releasing](#release)
- [FAQ](#faq)

## Usage

This action uses [commitlint](https://github.com/conventional-changelog/commitlint#readme) with the [config-conventional configuration][1] to ensure merge commits meet the conventional commit [spec][0].

This action lints the pull request's title, and in the case of a PR with a single commit, the commit message (see [FAQ](#faq) for details).

### Configuration

Create a [github action](https://docs.github.com/en/actions/quickstart) workflow:

```yml
# .github/workflows/conventional-pr.yml

name: conventional-pr
on:
  pull_request:
    branches:
      - main
      - master
    types:
      - opened
      - edited
      - synchronize
jobs:
  lint-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # check for the most recent release: https://github.com/CondeNast/conventional-pull-request-action/releases
      # replace vX.X.X below with the most recently released version
      - uses: CondeNast/conventional-pull-request-action@vX.X.X
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          # to override config-conventional rules, specify a relative path to your rules module, actions/checkout is required for this setting!
          commitlintRulesPath: "./commitlint.rules.js" # default: undefined
          # if the PR contains a single commit, fail if the commit message and the PR title do not match
          commitTitleMatch: "true" # default: 'true'
          # if you squash merge PRs and have your github repo set to always use the PR title as the merge commit, you can disable all linting of commits
          ignoreCommits: "false" # default: 'false'
```

### Rule Overrides

This action supports overriding rules from [config-conventional][1] (see this repo as an example):

> Your rules file must export an object with a `rules` field, other `commitlint` configuration fields are not supported.

```js
// ./commitlint.rules.js

module.exports = {
  rules: {
    ...
  }
}
```

> If you use `commitlint` in your git hooks, you can extend your custom rules in your [`commitlint.config.js`](commitlint.config.js) so the `commitlint` rules config is shared between your hook and this action, ex: [`commitlint.config.js`](commitlint.config.js)

```js
// ./commitlint.config.js

module.exports = {
  extends: ["@commitlint/config-conventional", "./commitlint.rules.js"],
};
```

## Contributing

[How to contribute](CONTRIBUTING.md)

### Dev

#### Install

```sh
nvm use
npm i
```

Github javascript actions require all dependencies to be checked into the codebase, so we use [ncc](https://github.com/vercel/ncc) to compile all dependencies and source code into a single file. To make changes to this action, compile and commit:

```sh
npm run prepare
git add .
git commit
```

> Be sure to commit and push all changed files in `./dist` to see your changes to the action execute.

### Release

From the up-to-date `main` branch:

```sh
npm run release
git push --follow-tags
```

## FAQ

**_1. Why is my commit required to conform with the [spec][0]?_**

In the case of pull requests with a single commit, when a developer merges the PR, github will autofill the merge commit message with the PR's commit message, instead of the PR's title. By enforcing the [spec][0] on the single commit, the pre-populated merge commit message will conform to the [spec][0].

**_2. Why must my commit message match the PR title?_**

In the case of pull requests with a single commit, the commit message will be used as the merge commit message. In PRs with multiple commits, the PR title is used as the merge commit message. By enforcing a commit message/PR title match, we ensure a merge commit message will always match a PR title, no matter how many commits are included in a pull request.

> To disable this behavior set `commitTitleMatch: 'false'`, see [configuration](#configuration)

> To disable all linting of commits and only lint your PR title, set `ignoreCommits: 'true'`, see [configuration](#configuration)

## Contributors

See the list of [contributors](https://github.com/CondeNast/conventional-pull-request/contributors) who participated in writing this tool.

[0]: https://www.conventionalcommits.org/en/v1.0.0/#specification
[1]: https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional
