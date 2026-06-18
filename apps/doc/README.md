# @template/doc

The documentation site for this monorepo, built with
[Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

Content lives in `src/content/docs/` as `.md`/`.mdx` files; each file maps to a
route by its path. Edit the sidebar and site config in
[astro.config.mjs](astro.config.mjs).

## Commands

Run from the repo root via the workspace filter:

| Command                                       | Action                                        |
| :-------------------------------------------- | :-------------------------------------------- |
| `pnpm --filter @template/doc dev`             | Start the dev server at `localhost:4321`      |
| `pnpm --filter @template/doc build`           | Build the production site to `./dist/`        |
| `pnpm --filter @template/doc preview`         | Preview the production build locally          |
| `pnpm --filter @template/doc typecheck`       | Type-check with `astro check`                 |

The root scripts pick this app up automatically: `pnpm dev` runs it alongside
the packages, and `pnpm typecheck` includes its `astro check`.
