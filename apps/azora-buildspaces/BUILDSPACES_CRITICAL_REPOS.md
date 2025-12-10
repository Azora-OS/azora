# BuildSpaces Critical Repos

This document describes the critical repositories and considerations for BuildSpaces. It tracks areas that require careful coordination, ownership, or cleanup during the BuildSpaces recovery and consolidation work.

## Major Repos
- apps/azora-buildspaces — primary UI and marketing site for BuildSpaces.
- services/* — back-end microservices used by BuildSpaces and local dev infra.

## v0 Cleanup Note ✅

We discovered multiple references to "v0" across documentation, lockfiles, and build artifacts while restoring the BuildSpaces UI. Some occurrences are historical and refer to early design drafts; others are actively used as package names or build metadata.

Scope & Recommendations:
- Keep historical mentions in docs as a reference (e.g. "Draft v0.1"). These are useful for archival and change history.

See `docs/V0_AUDIT_REPORT.md` for the full v0 audit report, classification, and recommended remediation steps.
- Replace or rename active metadata, package names, and generator strings with the preferred naming (e.g. `azora-buildspaces`) if they cause confusion in the CI/CD pipeline or are reused between packages.
- Avoid changing published package names until a migration and a clear deprecation policy are in place.
- Once the list of candidate files is created, open a PR per grouping (docs vs build/package metadata) and schedule for review.

Action Items:
1. Search for "v0" across the repository and flag occurrences that are:
  - a) generator metadata or package internals — clean/rename.
  - b) documentation and draft references — keep but prefix with 'Draft' or 'Historical'.
2. Create a PR to rename package internal name in package-locks and package.jsons for packages we fully control (non-published or local-only).
3. Fix build metadata issues by cleaning .next and re-building after renaming or updating generator fields.
4. Coordinate with DevOps/CI owners to ensure the next release packages and build metadata are updated and that the change won't affect downstream references.

If you want, I can start producing the list of files that fit each category and propose a starter PR with simple renames where applicable.

## Recent Recovery Notes (Dev)

- During the restore process, I discovered an empty package.json at `packages/@azora/core/package.json` which caused `pnpm install` to fail. I added a minimal placeholder package.json to allow installations and builds to proceed locally for the UI team. This file should be reviewed and populated with the correct package metadata before publishing or harmonizing with workspace-level settings.
- Added placeholder pages for the following routes to remove 404s and allow the site to be navigable in local dev:
  - `/features/*` (code-chamber, agents, ai-studio, design-studio, command-desk, maker-lab, spec-chamber, flowers)
  - `/docs`, `/docs/api`, `/tutorials`
  - `/pricing`, `/enterprise`, `/partners`, `/press`, `/careers`, `/compliance`
  - `/about`, `/contact`, `/privacy`, `/terms`, `/security`, `/changelog`

These are intentionally simple placeholders with the global Navbar and Footer, so the UI is navigable and style-consistent while content is gradually implemented.