#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3001}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
STAMP="$(date +%s)-$$"
EMAIL="presigned-certificate-${STAMP}@test.skillbridge.kh"
PASSWORD="Password123!"
PDF_BASE64="JVBERi0xLjQKU2tpbGxCcmlkZ2UgcHJlc2lnbmVkIHRlc3QKJSVFT0YK"

cleanup() {
  printf 'DELETE FROM "User" WHERE "email" = '\''%s'\'';\n' "$EMAIL" |
    pnpm --filter api exec prisma db execute --schema=prisma/schema.prisma --stdin >/dev/null 2>&1 || true
}
trap cleanup EXIT

json_value() {
  PAYLOAD="$1" python3 - "$2" <<'PY'
import json, os, sys
payload = json.loads(os.environ['PAYLOAD'])
print(eval(sys.argv[1], {'payload': payload}))
PY
}

REGISTER_JSON="$(curl -sS -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Presigned Certificate Test\",\"role\":\"student\"}")"
TOKEN="$(json_value "$REGISTER_JSON" "payload['token']")"
FILE_SIZE="$(python3 - <<PY
import base64
print(len(base64.b64decode('$PDF_BASE64')))
PY
)"

PRESIGN_JSON="$(curl -sS -X POST "$BASE/api/v1/certificates/upload-url" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"mimeType\":\"application/pdf\",\"originalName\":\"certificate.pdf\",\"fileSize\":$FILE_SIZE}")"
PRESIGN_PATH="$(json_value "$PRESIGN_JSON" "payload['upload']['path']")"
PRESIGN_TOKEN="$(json_value "$PRESIGN_JSON" "payload['upload']['token']")"

(
  cd "$ROOT_DIR/apps/api"
  SUPABASE_SIGNED_PATH="$PRESIGN_PATH" \
  SUPABASE_SIGNED_TOKEN="$PRESIGN_TOKEN" \
  SUPABASE_FILE_B64="$PDF_BASE64" \
  node <<'NODE'
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const body = Buffer.from(process.env.SUPABASE_FILE_B64, 'base64');
(async () => {
  const { error } = await client.storage
    .from(process.env.SUPABASE_CERTIFICATES_BUCKET)
    .uploadToSignedUrl(
      process.env.SUPABASE_SIGNED_PATH,
      process.env.SUPABASE_SIGNED_TOKEN,
      body,
      { contentType: 'application/pdf' },
    );
  if (error) throw error;
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
NODE
)

COMPLETE_JSON="$(curl -sS -X POST "$BASE/api/v1/certificates/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"Presigned certificate\",\"fileKey\":\"$PRESIGN_PATH\",\"mimeType\":\"application/pdf\",\"originalName\":\"certificate.pdf\",\"fileSize\":$FILE_SIZE}")"
CERTIFICATE_ID="$(json_value "$COMPLETE_JSON" "payload['certificate']['id']")"
SIGNED_URL="$(json_value "$COMPLETE_JSON" "payload['certificate']['fileUrl']")"
DOWNLOAD_STATUS="$(curl -sS -o /tmp/presigned-certificate-download.bin -w '%{http_code}' "$SIGNED_URL")"
[ "$DOWNLOAD_STATUS" = 200 ]
[ "$(python3 - <<'PY'
from pathlib import Path
print(Path('/tmp/presigned-certificate-download.bin').read_bytes()[:5].decode('latin1'))
PY
)" = '%PDF-' ]

DELETE_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' \
  -X DELETE "$BASE/api/v1/certificates/$CERTIFICATE_ID" \
  -H "Authorization: Bearer $TOKEN")"
[ "$DELETE_STATUS" = 200 ]

printf 'presigned upload, completion, signed download, and cleanup passed\n'
