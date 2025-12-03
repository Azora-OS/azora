#!/usr/bin/env bash
set -euo pipefail

# setup-dev.sh
# Cross-platform developer environment setup for AzStudio repo (Unix/macOS/Linux version)
# Example usage:
#   ./scripts/setup-dev.sh --bootstrap --compile --run-tests

usage() {
  cat <<EOF
Usage: $0 [--bootstrap] [--compile] [--run-tests] [--skip-native]

Options:
  --bootstrap     Run repo bootstrap steps (npm ci + install build deps)
  --compile       Run 'npm run compile' inside azstudio
  --run-tests     Run dev smoke tests and Node unit tests
  --skip-native   Pass --ignore-scripts when running npm ci (avoid native builds)
  -h|--help       Show this help message
EOF
}

BOOTSTRAP=false
COMPILE=false
RUN_TESTS=false
SKIP_NATIVE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --bootstrap) BOOTSTRAP=true; shift;;
    --compile) COMPILE=true; shift;;
    --run-tests) RUN_TESTS=true; shift;;
    --skip-native) SKIP_NATIVE=true; shift;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown option: $1"; usage; exit 1;;
  esac
done

REQUIRED_NODE="22.20.0"
NODE_VERSION=$(node -v 2>/dev/null || true)
if [[ -z "$NODE_VERSION" ]]; then
  echo "[ERROR] Node.js not found. Install Node $REQUIRED_NODE or a compatible LTS version and ensure node is in PATH." >&2
  exit 1
fi

echo "Found Node version: $NODE_VERSION"

# Ensure git is available
if ! command -v git >/dev/null 2>&1; then
  echo "[WARN] git not found on PATH. Install git for repo operations." >&2
fi

# Bootstrap
if [ "$BOOTSTRAP" = true ]; then
  echo "==> Running root npm ci"
  if $SKIP_NATIVE; then
    npm ci --ignore-scripts
  else
    npm ci
  fi

  if [ -d azstudio ]; then
    pushd azstudio >/dev/null
    echo "==> Running azstudio package npm ci"
    if $SKIP_NATIVE; then
      npm ci --ignore-scripts
    else
      npm ci
    fi
    popd >/dev/null
  else
    echo "[WARN] azstudio directory not found; skipping azstudio package install" >&2
  fi
fi

if [ "$COMPILE" = true ]; then
  echo "==> Compiling azstudio"
  pushd azstudio >/dev/null
  npm run compile
  popd >/dev/null
fi

if [ "$RUN_TESTS" = true ]; then
  echo "==> Running dev smoke tests and unit tests"
  pushd azstudio >/dev/null
  npm run local-unit-tests || echo "Local unit tests failed; check logs"
  npm run ai-esbuild-test || echo "AI esbuild test failed; ensure esbuild and dev-runner are configured"
  popd >/dev/null
fi

cat <<EOF
Setup completed - summary:
 - If you ran --bootstrap, packages are installed.
 - If you ran --compile, the app was compiled to azstudio/out.
 - You can run additional checks with:
     cd azstudio
     npm run compile
     npm run local-unit-tests
     npm run ai-esbuild-test

EOF

exit 0
