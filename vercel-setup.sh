#!/usr/bin/env bash
# Installs proto and the toolchain defined in .prototools for Vercel builds.
# Sourced from apps/frontend/vercel.json (Vercel root directory is apps/frontend).
set -euo pipefail

PROTOTOOLS="$(git rev-parse --show-toplevel)/.prototools"
PROTO_VERSION=$(sed -nE 's/^proto\s*=\s*"([^"]+)"/\1/p' "$PROTOTOOLS")

# Install proto (pinned to the version from .prototools).
# We download to a temp file instead of piping curl into bash so that a failed
# download doesn't silently feed empty input to the shell.
# Note: proto publishes SHA-256 checksums for its release binaries, but not for
# the install script itself, so full checksum verification would require
# reimplementing the installer. The temp-file approach is a pragmatic middle ground.
INSTALLER=$(mktemp)
curl -fsSL -o "$INSTALLER" https://moonrepo.dev/install/proto.sh
bash "$INSTALLER" "$PROTO_VERSION" --yes --no-profile
rm -f "$INSTALLER"

# Make proto and its managed tools available
export PATH="$HOME/.proto/shims:$HOME/.proto/bin:$PATH"

# Install the toolchain (node, pnpm, npm) from .prototools
proto install
