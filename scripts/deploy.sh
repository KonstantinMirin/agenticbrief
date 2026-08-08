#!/usr/bin/env bash
#
# Build every site and publish it to the directory Caddy serves.
#
# The sites are fully static, so "deploy" means: build, then atomically swap the
# built directory into place. Nothing listens on a port, which is why there is
# no 0.0.0.0 binding to get wrong here -- Caddy reads from disk.
#
# Usage:
#   scripts/deploy.sh              # build and publish all sites
#   scripts/deploy.sh adcpexplorer # just one
#   DRY_RUN=1 scripts/deploy.sh    # build only, do not publish
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEBROOT="${WEBROOT:-/srv/www}"
DRY_RUN="${DRY_RUN:-0}"

SITES=(agenticadlab briefgateway adcpexplorer aampexplorer whatisagenticbuying adtechglossary)

if [[ $# -gt 0 ]]; then
  SITES=("$@")
fi

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!!!\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31mERR\033[0m %s\n' "$*" >&2; exit 1; }

cd "$ROOT"

log "Regenerating protocol data from spec repos"
npm run --silent data:all || warn "spec parse failed; building against existing data/"

log "Building ${#SITES[@]} site(s)"
for site in "${SITES[@]}"; do
  [[ -d "sites/$site" ]] || die "unknown site: $site"
  log "  build $site"
  npm run --silent build --workspace="@agenticbrief/site-$site"
done

log "Generating OG cards"
node scripts/og-generator/generate.mjs || warn "OG generation failed; sites keep their previous cards"

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN=1 — built but not published"
  exit 0
fi

for site in "${SITES[@]}"; do
  src="$ROOT/sites/$site/dist"
  [[ -d "$src" ]] || die "no dist/ for $site — build must have failed"

  # Refuse to publish an obviously broken build rather than replacing a working
  # site with an empty directory.
  page_count=$(find "$src" -name '*.html' | wc -l)
  [[ "$page_count" -ge 1 ]] || die "$site built 0 HTML pages; refusing to publish"
  [[ -f "$src/index.html" ]] || die "$site has no index.html; refusing to publish"

  dest="$WEBROOT/$site"
  staging="$WEBROOT/.staging-$site"

  log "Publishing $site ($page_count pages) -> $dest"
  sudo rm -rf "$staging"
  sudo mkdir -p "$staging"
  sudo cp -a "$src/." "$staging/"
  sudo chown -R www-data:www-data "$staging" 2>/dev/null || sudo chown -R root:root "$staging"
  sudo chmod -R a+rX "$staging"

  # Swap: move the old aside, move the new in, then delete the old. Keeps the
  # window where the directory does not exist to a single rename.
  if [[ -d "$dest" ]]; then
    sudo rm -rf "$dest.old"
    sudo mv "$dest" "$dest.old"
  fi
  sudo mkdir -p "$(dirname "$dest")"
  sudo mv "$staging" "$dest"
  sudo rm -rf "$dest.old"
done

log "Reloading Caddy"
sudo caddy validate --config /etc/caddy/Caddyfile >/dev/null || die "Caddyfile invalid; not reloading"
sudo systemctl reload caddy

log "Done. Verifying:"
for site in "${SITES[@]}"; do
  host=$(node -e "
    const m = require('fs').readFileSync('$ROOT/packages/shared-ui/src/sites.ts','utf8');
    const re = new RegExp(\"key: '$site'[\\\\s\\\\S]*?deployDomain: '([^']+)'\");
    const hit = m.match(re);
    process.stdout.write(hit ? hit[1] : '');
  ")
  [[ -n "$host" ]] || { warn "  $site: could not resolve deploy domain"; continue; }
  code=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 10 "https://$host/" || echo "000")
  printf '    %-28s https://%s -> HTTP %s\n' "$site" "$host" "$code"
done
