#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3001}"
STAMP="$(date +%s)-$$"
EMAIL="certificate-storage-${STAMP}@test.skillbridge.kh"
OTHER_EMAIL="certificate-storage-other-${STAMP}@test.skillbridge.kh"
PASSWORD="Password123!"
PASS=0
FAIL=0

cleanup() {
  (
    cd "$(dirname "${BASH_SOURCE[0]}")/.."
    printf 'DELETE FROM "User" WHERE "email" IN ('\''%s'\'', '\''%s'\'');\n' "$EMAIL" "$OTHER_EMAIL" |
      pnpm exec prisma db execute --schema=prisma/schema.prisma --stdin >/dev/null 2>&1
  ) || true
}
trap cleanup EXIT

assert_status() {
  local description="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    printf '  ✅ %s\n' "$description"
    PASS=$((PASS + 1))
  else
    printf '  ❌ %s (expected %s, got %s)\n' "$description" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

json_value() {
  PAYLOAD="$1" python3 - "$2" <<'PY'
import json, os, sys
payload = json.loads(os.environ['PAYLOAD'])
print(eval(sys.argv[1], {'payload': payload}))
PY
}

PDF_BASE64="JVBERi0xLjQKU2tpbGxCcmlkZ2Ugc3RvcmFnZSB0ZXN0CiUlRU9GCg=="

printf '== Certificate storage contract test (%s) ==\n' "$BASE"

REGISTER_JSON="$(curl -sS -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Certificate Storage Test\",\"role\":\"student\"}")"
TOKEN="$(json_value "$REGISTER_JSON" "payload['token']")"

OTHER_REGISTER_JSON="$(curl -sS -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$OTHER_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Other Certificate Student\",\"role\":\"student\"}")"
OTHER_TOKEN="$(json_value "$OTHER_REGISTER_JSON" "payload['token']")"

UPLOAD_BODY="$(python3 - <<PY
import json
print(json.dumps({
  'title': 'Storage contract certificate',
  'description': 'Disposable storage contract fixture',
  'file': {
    'base64': '$PDF_BASE64',
    'mimeType': 'application/pdf',
    'originalName': 'certificate.pdf',
  },
}))
PY
)"

UPLOAD_STATUS="$(curl -sS -o /tmp/certificate-storage-upload.json -w '%{http_code}' \
  -X POST "$BASE/api/v1/certificates" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "$UPLOAD_BODY")"
assert_status "student can upload a certificate" 201 "$UPLOAD_STATUS"
UPLOAD_JSON="$(< /tmp/certificate-storage-upload.json)"
CERTIFICATE_ID="$(json_value "$UPLOAD_JSON" "payload['certificate']['id']")"
FILE_URL="$(json_value "$UPLOAD_JSON" "payload['certificate']['fileUrl']")"

UNAUTHORIZED_STATUS="$(curl -sS -o /tmp/certificate-storage-unauthorized.json -w '%{http_code}' \
  -X GET "$BASE/api/v1/certificates/$CERTIFICATE_ID/download" \
  -H "Authorization: Bearer $OTHER_TOKEN")"
assert_status "another student cannot create a download URL" 404 "$UNAUTHORIZED_STATUS"

case "$FILE_URL" in
  http://*|https://*)
    printf '  ✅ certificate returns a signed URL\n'; PASS=$((PASS + 1)) ;;
  *)
    printf '  ❌ certificate returns a signed URL (got %s)\n' "$FILE_URL"; FAIL=$((FAIL + 1)) ;;
esac

DOWNLOAD_STATUS="$(curl -sS -o /tmp/certificate-storage-download.bin -w '%{http_code}' "$FILE_URL")"
assert_status "signed certificate URL downloads" 200 "$DOWNLOAD_STATUS"

MAGIC="$(python3 - <<'PY'
from pathlib import Path
print(Path('/tmp/certificate-storage-download.bin').read_bytes()[:5].decode('latin1'))
PY
)"
assert_status "downloaded object keeps PDF signature" '%PDF-' "$MAGIC"

INVALID_BODY="$(python3 - <<PY
import json
print(json.dumps({
  'title': 'Invalid storage fixture',
  'file': {
    'base64': '$PDF_BASE64',
    'mimeType': 'text/plain',
    'originalName': 'certificate.txt',
  },
}))
PY
)"
INVALID_STATUS="$(curl -sS -o /tmp/certificate-storage-invalid.json -w '%{http_code}' \
  -X POST "$BASE/api/v1/certificates" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "$INVALID_BODY")"
assert_status "unsupported certificate type is rejected" 400 "$INVALID_STATUS"

DELETE_STATUS="$(curl -sS -o /tmp/certificate-storage-delete.json -w '%{http_code}' \
  -X DELETE "$BASE/api/v1/certificates/$CERTIFICATE_ID" \
  -H "Authorization: Bearer $TOKEN")"
assert_status "student can delete their certificate" 200 "$DELETE_STATUS"

printf '\n== Result: %d passed, %d failed ==\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
