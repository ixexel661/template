# Agent instructions

This is a reusable **pnpm-workspace monorepo template** for building TypeScript
libraries. It ships strict TypeScript, Biome, tsdown, Vitest, knip, taze, bumpp
and lefthook pre-wired. ESM only.

> The `@template/*` package scope and the `author` field are placeholders.
> When starting a real project, rename the scope across the workspace and update
> `author`/`repository` in each `package.json`.

## Development workflow

- The git base branch is `main`.
- Use `pnpm` as the package manager. It is pinned via `devEngines`, so `npm` and
  `npx` fail with `EBADDEVENGINES`; reach for `pnpm` or `pnpm dlx` instead.
- It is a pnpm workspace monorepo (see `pnpm-workspace.yaml`) with two groups:
  - `packages/*` holds the publishable libraries plus shared config:
    - `@template/config` — the shared `tsconfig.base.json` and `tsdown.base.ts`,
      consumed by every package. It is `private` and not published.
    - `@template/example` — a sample library that doubles as the template for
      new packages.
  - `apps/*` holds standalone apps, currently `@template/doc`, an Astro Starlight
    documentation site.
- To work on a single package, use `pnpm --filter <name> <script>`, e.g.
  `pnpm --filter @template/example test`.

### Core principles

- Every automated check has to pass.
- Prefer the clear, maintainable solution over the clever one.
- Skip comments unless they explain something non-obvious. JSDoc on the public
  API is expected.

### Mandatory validation steps

Run these from the repo root after making changes:

- `pnpm check:fix` formats and lints with Biome (auto-fix).
- `pnpm typecheck` type-checks every package (`tsc --noEmit`).
- `pnpm test` runs the tests (Vitest).
- `pnpm build` builds the bundles (tsdown, ESM plus `.d.ts`).

## Adding a new package

Copy `packages/example` as the starting point:

1. Rename `name` in its `package.json` (and update `author`/`repository`).
2. Add a `references` entry pointing at the new package in the root
   [tsconfig.json](tsconfig.json).
3. The package's `tsconfig.json`, `tsdown.config.ts` and `vitest.config.ts`
   inherit from `@template/config` — keep them thin and follow the example.

## Dependencies

Shared dependency versions live in the pnpm **catalog** in
[pnpm-workspace.yaml](pnpm-workspace.yaml). Reference them from each
`package.json` with the `catalog:` protocol (e.g. `"vitest": "catalog:"`) so a
version is defined once for the whole workspace. When adding a dependency, add
its version to the `catalog:` block and reference it with `catalog:` rather than
pinning a version inline. Workspace-internal packages still use `workspace:*`.

## Code style

**Always** read the existing code and follow its patterns before writing new
code.

Do not fuss over formatting while writing. Run `pnpm check:fix` to apply the
project style. Biome is set up for tabs, double quotes, and imports and exports
sorted alphabetically.

`knip` reports unused files and dependencies. If it flags a config file, add it
as an entry in [knip.json](knip.json) rather than turning the check off.

## Testing

Read the existing tests for similar functionality before writing new ones, and
follow their patterns.

- Tests sit next to the source as `<name>.test.ts`.
- Vitest runs with globals enabled (`globals: true`); see
  [vitest.config.ts](vitest.config.ts) and the per-package
  [packages/example/vitest.config.ts](packages/example/vitest.config.ts).
- Run one package's tests with `pnpm --filter <name> test`.

## Releasing

`bumpp` handles versioning (`pnpm release`, recursive). There is no changeset
workflow in this repo.

`taze` keeps dependencies current (`pnpm taze`); it also runs as a git hook via
[lefthook.yml](lefthook.yml).
