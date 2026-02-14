#!/usr/bin/env bash
# Installs proto and the toolchain defined in .prototools for Vercel builds.
# Sourced from apps/frontend/vercel.json (Vercel root directory is apps/frontend).
set -euo pipefail

PROTOTOOLS="$(git rev-parse --show-toplevel)/.prototools"
PROTO_VERSION=$(grep '^proto' "$PROTOTOOLS" | cut -d'"' -f2)

# Install proto (pinned to the version from .prototools)
bash <(curl -fsSL https://moonrepo.dev/install/proto.sh) "$PROTO_VERSION" --yes --no-profile

# Make proto and its managed tools available
export PATH="$HOME/.proto/shims:$HOME/.proto/bin:$PATH"

# Install the toolchain (node, pnpm, npm) from .prototools
proto install
