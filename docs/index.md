---
layout: home

hero:
  name: DevKit
  text: A developer productivity CLI that documents itself
  tagline: Scaffold projects, inspect repositories, test endpoints and keep documentation fresh with nightly automated commits.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: Commands
      link: /commands
    - theme: alt
      text: GitHub
      link: https://github.com/buzludeniz/devkit

features:
  - title: Eleven focused commands
    details: Scaffold projects, inspect git state, measure complexity, test endpoints, parse env files, generate docs, build changelogs and load plugins.
  - title: Ten nightly commits
    details: A scheduled GitHub Actions workflow refreshes ten independent reports every night and opens a pull request with the results.
  - title: Self-documenting
    details: Architecture, dependency, size, test and API reports are generated from the repository itself, so the documentation cannot drift.
  - title: Typed and tested
    details: Strict TypeScript, Vitest coverage for every command, Biome formatting and Changesets releases.
---
