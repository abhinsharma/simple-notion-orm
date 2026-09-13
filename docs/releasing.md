# Releasing

Releases are published manually to npm and GitHub. Use Node.js 24 LTS and the pnpm version in `package.json`.

1. Update the package version and changelog. Use a minor version for breaking changes while the package is below 1.0.
2. Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm format:check`, `pnpm tsc`, `pnpm test`, and `pnpm build`.
3. Run `npm pack --dry-run` and import the built package from a separate consumer project. Check that the tarball contains only package files, not fixtures or secrets.
4. Commit and push the release changes. Wait for CI to pass on the commit being released.
5. Run `npm whoami`. If authentication has expired, run `npm login` and complete the browser sign-in. Never put credentials in the repository.
6. Run `npm publish --access public`. Complete any npm two-factor prompt, then check `npm view simple-notion-orm version`.
7. Tag the published commit as `v<version>`, push the tag, and create a GitHub release using the changelog entry.
8. Install the published version in a clean consumer project and verify its exports.

If npm authentication blocks publication, finish validation and push the release commit. A GitHub release may be published separately, but its notes must state that npm publication is pending. Do not describe the package as published until the registry confirms the version.
