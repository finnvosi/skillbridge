#!/usr/bin/env bash
# ============================================================================
# SkillBridge — Database restore (RESTORE layer)
# ----------------------------------------------------------------------------
# Restores a SQL dump produced by db-backup.sh.
#
# WARNING: this OVERWRITES the target database. Only run against the intended
# environment. For point-in-time recovery, prefer Supabase PITR instead.
#
# Usage: ./scripts/db-restore.sh dumps/skillbridge_2026-08-10_020000.sql.gz
#        ./scripts/db-restore.sh dumps/skillbridge_2026-08-10_020000.sql
# ============================================================================
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <dump.sql | dump.sql.gz>" >&2
  exit 1
fi

DUMP="$1"
: "${DATABASE_URL:?DATABASE_URL must be set (or use PGUSER/PGHOST/PGDATABASE)}"

if [ ! -f "$DUMP" ]; then
  echo "error: file not found: $DUMP" >&2
  exit 1
fi

echo ">> Restoring $DUMP into the database at DATABASE_URL"
echo ">> This will OVERWRITE the target database. Ctrl-C now to abort (5s)..."
sleep 5

if [[ "$DUMP" == *.gz ]]; then
  gunzip -c "$DUMP" | psql --no-owner --single-transaction "$DATABASE_URL"
else
  psql --no-owner --single-transaction "$DATABASE_URL" < "$DUMP"
fi

echo ">> Restore complete."
