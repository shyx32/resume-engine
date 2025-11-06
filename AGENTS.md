# Repository Guidelines

## Project Structure & Module Organization
- Keep all executable code in `src/`, splitting responsibilities as outlined in `developer-guide.md`: `src/core` for schema logic, `src/runtime` for renderer utilities, `src/vue` for editor components, `src/exporters` for PDF/Word pipelines, and `src/templates` for reusable resume presets.
- Co-locate specs with their modules under `__tests__` folders or mirror every major module inside `tests/` when end-to-end coverage is needed.
- Store shared assets (icons, sample data, template screenshots) in `public/` or `assets/` and import them through Vite’s asset handling to avoid bundler surprises.
- When adding new packages or configuration, document the rationale in `developer-guide.md` so downstream agents can stay aligned with the architecture narrative.

## Build, Test, and Development Commands
- `npm install` (or `yarn install`) bootstraps dependencies; always run it after pulling changes that touch `package.json`.
- `npm run dev` spins up the Vite playground so you can iterate on the Vue editor and template previews with hot module reload.
- `npm run build` produces the distributable bundles in `dist/`; confirm both ESM and UMD outputs before publishing.
- `npm run lint` and `npm run format` (if defined) must pass prior to opening a pull request; run them together with `npm run typecheck` for TypeScript safety.
- `npm run test` executes the unit test suite; prefer running it with `--watch` while iterating on core logic.

## Coding Style & Naming Conventions
- Use TypeScript across the codebase with 2-space indentation and trailing commas enabled; let ESLint/Prettier formatting stand as the source of truth.
- Name Vue single-file components in `PascalCase.vue`, export reusable hooks as `useXyz`, and reserve `snake_case` exclusively for JSON schema payloads that must mirror backend contracts.
- Prefer explicit type aliases over `any`; surface shared interfaces from `src/core/types.ts`.

## Testing Guidelines
- Write unit tests with Vitest (the default Vite test runner). Place focused logic tests next to their subjects and integration flows in `tests/`.
- Follow the naming pattern `<module>.spec.ts` for unit scopes and `<feature>.e2e.ts` for higher-level coverage.
- Target a minimum 80 % statement coverage for modules inside `src/core` and `src/runtime`; exporters can rely on snapshot assertions against fixture resumes.

## Commit & Pull Request Guidelines
- Adopt Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`) to keep the history machine-readable; the current log already demonstrates succinct summaries (`Initial commit`).
- Open pull requests with concise descriptions detailing the change, affected modules, and test evidence (`npm run test`, `npm run build`). Link related issues and attach screenshots or PDFs when UI, template, or export behavior changes.
- Mark breaking API changes with `feat!:`, call out required migrations, and update `developer-guide.md` in the same PR.
