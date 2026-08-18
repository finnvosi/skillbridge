#!/usr/bin/env bash
# SkillBridge signup/onboarding contract tests.
# Requires a running API and a local/dev database.
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3001}"
STAMP="$(date +%s)-$$"
STUDENT_EMAIL="onboarding-student-${STAMP}@test.skillbridge.kh"
EMPLOYER_EMAIL="onboarding-employer-${STAMP}@test.skillbridge.kh"
WORKER_EMAIL="onboarding-worker-${STAMP}@test.skillbridge.kh"
PASS=0
FAIL=0
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
WORKER_RESPONSE=""
REGISTER_RESPONSE=""
ONBOARDING_RESPONSE=""
EMPLOYER_RESPONSE=""

cleanup() {
  rm -f "${WORKER_RESPONSE:-}" "${REGISTER_RESPONSE:-}" "${ONBOARDING_RESPONSE:-}" "${EMPLOYER_RESPONSE:-}"
  (
    cd "$ROOT_DIR"
    printf 'DELETE FROM "User" WHERE "email" IN ('"'"'%s'"'"', '"'"'%s'"'"');\n' "$STUDENT_EMAIL" "$EMPLOYER_EMAIL" |
      pnpm --filter api exec prisma db execute --schema=prisma/schema.prisma --stdin >/dev/null 2>&1
  ) || true
}
trap cleanup EXIT

assert_status() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    printf '  ✅ %s\n' "$description"
    PASS=$((PASS + 1))
  else
    printf '  ❌ %s (expected %s, got %s)\n' "$description" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_json() {
  local description="$1"
  local expression="$2"
  local payload="$3"
  if PAYLOAD="$payload" python3 - "$expression" <<'PY'
import json, os, sys
payload = json.loads(os.environ['PAYLOAD'])
expression = sys.argv[1]
if not bool(eval(expression, {'payload': payload})):
    raise SystemExit(1)
PY
  then
    printf '  ✅ %s\n' "$description"
    PASS=$((PASS + 1))
  else
    printf '  ❌ %s\n' "$description"
    FAIL=$((FAIL + 1))
  fi
}

printf '== Signup/onboarding contract tests (%s) ==\n' "$BASE"

WORKER_RESPONSE="$(mktemp)"
WORKER_STATUS=$(curl -sS -o "$WORKER_RESPONSE" -w '%{http_code}' -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$WORKER_EMAIL\",\"password\":\"Password123!\",\"name\":\"Legacy Worker\",\"role\":\"worker\"}")
assert_status "public registration rejects legacy worker accounts" "400" "$WORKER_STATUS"

REGISTER_RESPONSE="$(mktemp)"
REGISTER_STATUS=$(curl -sS -o "$REGISTER_RESPONSE" -w '%{http_code}' -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"Password123!\",\"name\":\"Onboarding Student\",\"role\":\"student\"}")
REGISTER_JSON="$(< "$REGISTER_RESPONSE")"
assert_status "student registration succeeds" "201" "$REGISTER_STATUS"
assert_json "new account is marked onboarding-incomplete" "payload['user']['onboardingCompleted'] is False" "$REGISTER_JSON"
TOKEN=$(PAYLOAD="$REGISTER_JSON" python3 - <<'PY'
import json, os
print(json.loads(os.environ['PAYLOAD']).get('token', ''))
PY
)

ONBOARDING_RESPONSE="$(mktemp)"
ONBOARDING_STATUS=$(curl -sS -o "$ONBOARDING_RESPONSE" -w '%{http_code}' -X PUT "$BASE/api/v1/users/onboarding" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"university":"RUPP","major":"Computer Science","graduationYear":2027,"location":"Phnom Penh","skills":["React","TypeScript","UI/UX"],"opportunityTypes":["internship","part_time"],"workPreference":"hybrid"}')
ONBOARDING_JSON="$(< "$ONBOARDING_RESPONSE")"
assert_status "student can complete onboarding" "200" "$ONBOARDING_STATUS"
assert_json "onboarding completion is persisted in response" "payload['user']['onboardingCompleted'] is True" "$ONBOARDING_JSON"
assert_json "student preferences are persisted" "payload['user']['profile']['location'] == 'Phnom Penh' and payload['user']['profile']['skills'] == ['React', 'TypeScript', 'UI/UX']" "$ONBOARDING_JSON"

ME_JSON=$(curl -sS "$BASE/api/v1/auth/me" -H "Authorization: Bearer $TOKEN")
assert_json "auth/me returns completed onboarding state" "payload['user']['onboardingCompleted'] is True" "$ME_JSON"

EMPLOYER_REGISTER=$(curl -sS -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMPLOYER_EMAIL\",\"password\":\"Password123!\",\"name\":\"Hiring Lead\",\"role\":\"employer\"}")
EMPLOYER_TOKEN=$(PAYLOAD="$EMPLOYER_REGISTER" python3 - <<'PY'
import json, os
print(json.loads(os.environ['PAYLOAD']).get('token', ''))
PY
)
EMPLOYER_RESPONSE="$(mktemp)"
EMPLOYER_STATUS=$(curl -sS -o "$EMPLOYER_RESPONSE" -w '%{http_code}' -X PUT "$BASE/api/v1/users/onboarding" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"companyName":"Mekong Product Studio","position":"Hiring Manager","industry":"Technology","companySize":25,"website":"","location":"Phnom Penh","hiringTypes":["internship","full_time"],"hiringSkills":["React","Product Design"],"workPreference":"either"}')
EMPLOYER_JSON="$(< "$EMPLOYER_RESPONSE")"
assert_status "employer can complete onboarding without a website" "200" "$EMPLOYER_STATUS"
assert_json "employer hiring goals are persisted" "payload['user']['onboardingCompleted'] is True and payload['user']['profile']['hiringSkills'] == ['React', 'Product Design']" "$EMPLOYER_JSON"

printf '\n== Result: %d passed, %d failed ==\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
