# Public Release Checklist

This document is for repository and npm releases after `v0.1.0`.

## Current public entry points

- GitHub repository: [yama662607/anki-mcp](https://github.com/yama662607/anki-mcp)
- GitHub releases: [releases page](https://github.com/yama662607/anki-mcp/releases)
- npm package: [anki-mcp](https://www.npmjs.com/package/@yama662607/anki-mcp)

## Before publishing

1. Keep `master` green on CI.
2. Run `npm test`.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Run `npm pack --dry-run` and confirm the tarball only contains release assets.
6. Confirm `README.md` matches the current install and MCP setup flow.
7. Bump `package.json` version.

## Publishing

1. Commit the version bump and push it.
2. Run `npm publish --access public`.
3. If npm requires write authentication, complete the browser or security-key approval flow.
4. Verify the package with `npm view anki-mcp name version dist-tags.latest --json`.

## After publishing

1. Create a GitHub release tag `v<version>` from the published commit.
2. Add short release notes with the user-visible changes.
3. Confirm the README badge shows the new npm version.
4. Smoke-test installation with `npm install -g @yama662607/anki-mcp@<version>`.
5. Smoke-test startup with `anki-mcp`.

## Notes

- GitHub release and npm publish are separate operations.
- Keep the GitHub release tag aligned with the commit that produced the published npm tarball.
