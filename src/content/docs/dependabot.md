---
title: Dependabot
description: Automatic alerts and update pull requests for the third-party code the site depends on.
order: 4
updated: 2026-10-17
---

## What it is

Most software is built on other people's code: libraries, frameworks, tools. When one of them has a security hole, everything that uses it is exposed. That's a **software supply chain** risk. **Dependabot** watches those dependencies and acts when something changes.

## How it's set up here

- **npm packages** (the site's build tools, like Astro) and **GitHub Actions** versions are checked **weekly**.
- Small updates (minor and patch versions) are **grouped** into one pull request to keep the noise down.
- **Security alerts** fire as soon as a known vulnerability affects a dependency, independent of the weekly schedule.
- **Config:** [`.github/dependabot.yml`](https://github.com/camtoan-do/kamllistos/blob/main/.github/dependabot.yml).

## How an update gets merged

1. Dependabot opens a pull request with release notes.
2. [CI](/docs/github-actions/) builds and checks the site, and [CodeQL](/docs/codeql/) scans it.
3. If everything is green, it's merged and appears on the [changelog](/changelog/).

The site intentionally has very few dependencies. The fewer third-party packages, the smaller the supply chain to defend.
