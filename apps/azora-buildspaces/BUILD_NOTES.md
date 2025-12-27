# Build Notes — azora-buildspaces

- Native canvas dependency: `canvas` (node-canvas) requires system libraries to build on Linux. If you see build failures during `pnpm install` mentioning `pixman-1` or `pkg-config`, install the following packages on Ubuntu/Debian:

  sudo apt-get update
  sudo apt-get install -y pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libpixman-1-dev build-essential python3 make g++

- Environment variables (for local development):
  - `JWT_SECRET` - any value for local dev
  - `NEXT_PUBLIC_PREDAI_API_URL` - default: `http://localhost:3015`
  - `REDIS_URL` - default: `redis://localhost:6379` (if using Redis features)
  - `DATABASE_URL` - Postgres connection string if running DB-backed features

- CI: A GitHub Actions workflow (`.github/workflows/buildspaces.yml`) installs the necessary system packages and builds both `azora-buildspaces` and `buildspaces-ui-reference`.

- Turbopack workspace root warning: If Next.js warns about inferred workspace root, add `turbopack.root` to `apps/buildspaces-ui-reference/next.config.js` (already added).

- If you plan to run E2E tests that exercise native `canvas` features, ensure the CI runner includes the system packages above.
