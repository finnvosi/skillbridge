#!/usr/bin/env bash
# ============================================================================
# SkillBridge — Database backup (RESTORE layer)
# ----------------------------------------------------------------------------
# Dumps the Postgres DB to a timestamped SQL file under ./dumps and (optionally)
# pushes it to a Supabase Storage bucket for off-machine cold storage.
#
# Prereqs: `pg_dump` on PATH and DATABASE_URL (or PG* env vars) set.
# Wire this into a daily cron (Vercel Cron / GitHub Action / systemd timer).
#
# Usage: ./scripts/db-backup.sh
# ============================================================================
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set (or use PGUSER/PGHOST/PGDATABASE)}"

DUMP_DIR="${DUMP_DIR:-./dumps}"
mkdir -p "$DUMP_DIR"

STAMP="$(date +%Y-%m-%d_%H%M%S)"
OUT="$DUMP_DIR/skillbridge_${STAMP}.sql"

echo ">> Dumping database to $OUT"
pg_dump --no-owner --no-privileges --clean --if-exists "$DATABASE_URL" > "$OUT"
gzip -f "$OUT"
echo ">> Done: ${OUT}.gz"

# Optional: copy to Supabase Storage cold bucket (set BACKUP_BUCKET to enable).
if [ -n "${BACKUP_BUCKET:-}" ] && command -v supabase >/dev/null 2>&1; then
  echo ">> Uploading to storage bucket: $BACKUP_BUCKET"
  supabase storage upload "$BACKUP_BUCKET" "${OUT}.gz" --local
fi

# Keep only the most recent 30 dumps locally.
if command -v tail >/dev/null 2>&1; then
  ls -1t "$DUMP_DIR"/*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm -f
fi
