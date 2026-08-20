#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3001}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
STAMP="$(date +%s)-$$"
STUDENT_EMAIL="verification-student-${STAMP}@test.skillbridge.kh"
ADMIN_EMAIL="verification-admin-${STAMP}@test.skillbridge.kh"
PASSWORD="Password123!"
PDF_BASE64="JVBERi0xLjQKU2tpbGxCcmlkZ2UgdmlzaWJpbGl0eSB0ZXN0CiUlRU9GCg=="
PASS=0
FAIL=0

cleanup() {
  printf 'DELETE FROM "User" WHERE "email" IN ('\''%s'\'', '\''%s'\'');\n' "$STUDENT_EMAIL" "$ADMIN_EMAIL" |
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

assert_status() {
  if [ "$2" = "$3" ]; then
    printf '  ✅ %s\n' "$1"
    PASS=$((PASS + 1))
  else
    printf '  ❌ %s (expected %s, got %s)\n' "$1" "$2" "$3"
    FAIL=$((FAIL + 1))
  fi
}

student_json="$(curl -sS -X POST "$BASE/api/v1/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Verification Student\",\"role\":\"student\"}")"
student_token="$(json_value "$student_json" "payload['token']")"
admin_json="$(curl -sS -X POST "$BASE/api/v1/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Verification Admin\",\"role\":\"employer\"}")"
admin_token="$(json_value "$admin_json" "payload['token']")"
printf 'UPDATE "User" SET "role" = '\''admin'\'' WHERE "email" = '\''%s'\'';\n' "$ADMIN_EMAIL" |
  pnpm --filter api exec prisma db execute --schema=prisma/schema.prisma --stdin >/dev/null
admin_login="$(curl -sS -X POST "$BASE/api/v1/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\"}")"
admin_token="$(json_value "$admin_login" "payload['token']")"

upload="$(curl -sS -X POST "$BASE/api/v1/certificates" -H "Authorization: Bearer $student_token" -H 'Content-Type: application/json' -d "{\"title\":\"Verification fixture\",\"file\":{\"base64\":\"$PDF_BASE64\",\"mimeType\":\"application/pdf\",\"originalName\":\"verification.pdf\"}}")"
certificate_id="$(json_value "$upload" "payload['certificate']['id']")"

queue_status="$(curl -sS -o /tmp/certificate-verification-queue.json -w '%{http_code}' "$BASE/api/v1/admin/certificates" -H "Authorization: Bearer $admin_token")"
assert_status "admin can read certificate queue" 200 "$queue_status"

student_status="$(curl -sS -o /tmp/certificate-verification-student.json -w '%{http_code}' "$BASE/api/v1/certificates" -H "Authorization: Bearer $student_token")"
assert_status "student can read own certificate status" 200 "$student_status"
python3 - <<'PY'
import json
payload = json.load(open('/tmp/certificate-verification-student.json'))
certificate = payload['certificates'][0]
assert certificate['verificationStatus'] == 'pending'
assert 'verificationNote' not in certificate
PY
printf '  ✅ student receives pending status without internal note\n'; PASS=$((PASS + 1))

non_admin_status="$(curl -sS -o /tmp/certificate-verification-non-admin.json -w '%{http_code}' -X PATCH "$BASE/api/v1/admin/certificates/$certificate_id" -H "Authorization: Bearer $student_token" -H 'Content-Type: application/json' -d '{"status":"verified"}')"
assert_status "non-admin cannot review certificates" 403 "$non_admin_status"

missing_reason_status="$(curl -sS -o /tmp/certificate-verification-missing-reason.json -w '%{http_code}' -X PATCH "$BASE/api/v1/admin/certificates/$certificate_id" -H "Authorization: Bearer $admin_token" -H 'Content-Type: application/json' -d '{"status":"rejected"}')"
assert_status "rejection requires a reason" 400 "$missing_reason_status"

reject_status="$(curl -sS -o /tmp/certificate-verification-reject.json -w '%{http_code}' -X PATCH "$BASE/api/v1/admin/certificates/$certificate_id" -H "Authorization: Bearer $admin_token" -H 'Content-Type: application/json' -d '{"status":"rejected","rejectionReason":"The certificate image is not readable.","verificationNote":"Internal review fixture."}')"
assert_status "admin can reject with a reason" 200 "$reject_status"

student_status="$(curl -sS -o /tmp/certificate-verification-student-rejected.json -w '%{http_code}' "$BASE/api/v1/certificates" -H "Authorization: Bearer $student_token")"
assert_status "student sees rejection status" 200 "$student_status"
python3 - <<'PY'
import json
payload = json.load(open('/tmp/certificate-verification-student-rejected.json'))
certificate = payload['certificates'][0]
assert certificate['verificationStatus'] == 'rejected'
assert certificate['rejectionReason'] == 'The certificate image is not readable.'
assert 'verificationNote' not in certificate
PY
printf '  ✅ student receives candidate feedback but not internal note\n'; PASS=$((PASS + 1))

printf '\n== Result: %d passed, %d failed ==\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
