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

# --- NEW: notification privacy + audit trail + employer filtering ----------------

REJECT_REASON="The certificate image is not readable."
INTERNAL_NOTE="Internal review fixture."

# 1) Student notification: candidate-facing type, no internal fields leaked.
notifications_json="$(curl -sS "$BASE/api/v1/users/notifications" -H "Authorization: Bearer $student_token")"
NOTIFICATIONS_JSON="$notifications_json" REJECT_REASON="$REJECT_REASON" python3 - <<'PY'
import json, os
payload = json.loads(os.environ['NOTIFICATIONS_JSON'])
notifs = payload.get('notifications', [])
rejected = [n for n in notifs if n.get('type') == 'certificate_rejected']
assert rejected, 'expected a certificate_rejected notification for the student'
assert len(rejected) == 1, 'expected exactly one rejection notification'
for forbidden in ('verificationNote', 'internalNote', 'candidateReason', 'rejectionReason', 'fileKey', 'fileUrl'):
    assert forbidden not in rejected[0], f'notification leaked internal field {forbidden}'
assert os.environ['REJECT_REASON'] in rejected[0]['body'], 'rejection reason must be in candidate-facing body'
PY
printf '  ✅ student notification uses certificate_rejected type and leaks no internal note\n'; PASS=$((PASS + 1))

# 2) Immutable audit row persisted in CertificateVerificationHistory (read via client).
history_out="$(node "$(dirname "$0")/assert-certificate-history.mjs" "$certificate_id" 2>/dev/null)"
if printf '%s' "$history_out" | grep -q '"newStatus"'; then
  INTERNAL_NOTE="$INTERNAL_NOTE" REJECT_REASON="$REJECT_REASON" HISTORY_JSON="$history_out" python3 - <<'PY'
import json, os
row = json.loads(os.environ['HISTORY_JSON'])
assert row.get('newStatus') == 'rejected', 'history newStatus must be rejected'
assert row.get('internalNote') == os.environ['INTERNAL_NOTE'], 'history must persist internal note'
assert row.get('candidateReason') == os.environ['REJECT_REASON'], 'history must persist candidate reason'
assert row.get('previousStatus') in ('pending', 'verified', 'rejected'), 'previousStatus must be set'
PY
  printf '  ✅ certificate verification history row created (immutable audit)\n'; PASS=$((PASS + 1))
else
  printf '  ❌ certificate verification history row missing (got: %s)\n' "${history_out:0:120}"
  FAIL=$((FAIL + 1))
fi

# 3) Employer applicant filtering: only verified cert title/status/date exposed.
# Upload + approve a SECOND certificate so the student has one verified cert.
upload2="$(curl -sS -X POST "$BASE/api/v1/certificates" -H "Authorization: Bearer $student_token" -H 'Content-Type: application/json' \
  -d "{\"title\":\"Verified Skill Certificate\",\"file\":{\"base64\":\"$PDF_BASE64\",\"mimeType\":\"application/pdf\",\"originalName\":\"verified.pdf\"}}")"
certificate2_id="$(U2="$upload2" python3 -c "import json,os;print(json.loads(os.environ['U2'])['certificate']['id'])")"
curl -sS -o /dev/null -X PATCH "$BASE/api/v1/admin/certificates/$certificate2_id" \
  -H "Authorization: Bearer $admin_token" -H 'Content-Type: application/json' \
  -d "{\"status\":\"verified\"}"

employer_email="verification-employer-${STAMP}@test.skillbridge.kh"
employer_json="$(curl -sS -X POST "$BASE/api/v1/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$employer_email\",\"password\":\"$PASSWORD\",\"name\":\"Verification Employer\",\"role\":\"employer\"}")"
employer_token="$(EJ="$employer_json" python3 -c "import json,os;print(json.loads(os.environ['EJ'])['token'])")"
project_json="$(curl -sS -X POST "$BASE/api/v1/projects" -H "Authorization: Bearer $employer_token" -H 'Content-Type: application/json' \
  -d "{\"title\":\"Verification Project\",\"description\":\"Verification project used by the certificate filtering contract test.\",\"type\":\"part_time\",\"budget\":100,\"skillsRequired\":[\"testing\"],\"location\":\"Phnom Penh\"}")"
project_id="$(PJ="$project_json" python3 -c "import json,os;print(json.loads(os.environ['PJ'])['project']['id'])")"
apply_status="$(curl -sS -o /tmp/certificate-verification-apply.json -w '%{http_code}' -X POST "$BASE/api/v1/projects/$project_id/apply" -H "Authorization: Bearer $student_token" -H 'Content-Type: application/json' -d '{"coverLetter":"hi"}')"
if [ "$apply_status" != "201" ]; then
  printf '  ❌ student application fixture failed (status %s): %s\n' "$apply_status" "$(< /tmp/certificate-verification-apply.json)"
  exit 1
fi
apps_json="$(curl -sS "$BASE/api/v1/projects/$project_id/applications" -H "Authorization: Bearer $employer_token")"
APPS_JSON="$apps_json" python3 - <<'PY'
import json, os
payload = json.loads(os.environ['APPS_JSON'])
apps = payload.get('applications', [])
assert apps, 'expected the submitted application to appear for the employer'
certs = apps[0].get('student', {}).get('certificates', [])
assert certs, 'employer should see the verified certificate'
for c in certs:
    for forbidden in ('fileKey', 'fileUrl', 'rejectionReason', 'verificationNote', 'description', 'mimeType', 'fileSize'):
        assert forbidden not in c, f'employer certificate leaked internal field {forbidden}'
    assert c.get('verificationStatus') == 'verified', 'employer must only see verified certificates'
# The rejected certificate must NOT be present for the employer.
titles = [c['title'] for c in certs]
assert 'Verified Skill Certificate' in titles, 'verified certificate must be visible to employer'
assert 'Verification fixture' not in titles, 'rejected certificate must be hidden from employer'
PY
printf '  ✅ employer applicant view exposes only verified certificate title/status/date\n'; PASS=$((PASS + 1))

printf '\n== Result: %d passed, %d failed ==\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
