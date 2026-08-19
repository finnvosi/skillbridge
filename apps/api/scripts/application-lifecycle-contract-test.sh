#!/usr/bin/env bash
# Phase 2 lifecycle/security contract test. Requires a disposable local API and DB.
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3001}"
STAMP="$(date +%s)-$$"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PASSWORD="Password123!"
PASS=0
FAIL=0

STUDENT_ONE="lifecycle-student-one-${STAMP}@test.skillbridge.kh"
STUDENT_TWO="lifecycle-student-two-${STAMP}@test.skillbridge.kh"
STUDENT_THREE="lifecycle-student-three-${STAMP}@test.skillbridge.kh"
OWNER="lifecycle-owner-${STAMP}@test.skillbridge.kh"
FOREIGN="lifecycle-foreign-${STAMP}@test.skillbridge.kh"
TEAM="lifecycle-team-${STAMP}@test.skillbridge.kh"
INACTIVE_TEAM="lifecycle-inactive-team-${STAMP}@test.skillbridge.kh"
ADMIN="lifecycle-admin-${STAMP}@test.skillbridge.kh"

cleanup() {
  (
    cd "$ROOT_DIR"
    printf 'DELETE FROM "User" WHERE "email" LIKE '"'"'lifecycle-%%-%s@test.skillbridge.kh'"'"';\n' "$STAMP" |
      pnpm --filter api exec prisma db execute --schema=prisma/schema.prisma --stdin >/dev/null 2>&1
  ) || true
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
  local description="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    printf '  ✅ %s\n' "$description"
    PASS=$((PASS + 1))
  else
    printf '  ❌ %s (expected %s, got %s)\n' "$description" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_json() {
  local description="$1" expression="$2" payload="$3"
  if PAYLOAD="$payload" python3 - "$expression" <<'PY'
import json, os, sys
payload = json.loads(os.environ['PAYLOAD'])
if not bool(eval(sys.argv[1], {'payload': payload})):
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

register() {
  curl -sS -X POST "$BASE/api/v1/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$PASSWORD\",\"name\":\"$3\",\"role\":\"$2\"}"
}

request() {
  local method="$1" url="$2" token="$3" body="${4:-}"
  if [ -n "$body" ]; then
    curl -sS -o /tmp/skillbridge-lifecycle-response.json -w '%{http_code}' -X "$method" "$url" \
      -H "Authorization: Bearer $token" -H 'Content-Type: application/json' -d "$body"
  else
    curl -sS -o /tmp/skillbridge-lifecycle-response.json -w '%{http_code}' -X "$method" "$url" \
      -H "Authorization: Bearer $token"
  fi
}

audit_counts() {
  local application_id="$1"
  (
    cd "$ROOT_DIR/apps/api"
    APPLICATION_ID="$application_id" node <<'NODE'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const applicationId = process.env.APPLICATION_ID;
  const [history, events, notifications] = await Promise.all([
    prisma.applicationStatusHistory.count({ where: { applicationId } }),
    prisma.applicationEvent.count({ where: { applicationId } }),
    prisma.notification.count({ where: { applicationId } }),
  ]);
  process.stdout.write(JSON.stringify({ history, events, notifications }));
})().finally(() => prisma.$disconnect());
NODE
  )
}

printf '== Phase 2 lifecycle contract tests (%s) ==\n' "$BASE"

STUDENT_ONE_JSON="$(register "$STUDENT_ONE" student 'Lifecycle Student One')"
STUDENT_TWO_JSON="$(register "$STUDENT_TWO" student 'Lifecycle Student Two')"
STUDENT_THREE_JSON="$(register "$STUDENT_THREE" student 'Lifecycle Student Three')"
OWNER_JSON="$(register "$OWNER" employer 'Lifecycle Owner')"
FOREIGN_JSON="$(register "$FOREIGN" employer 'Lifecycle Foreign')"
TEAM_JSON="$(register "$TEAM" employer 'Lifecycle Team')"
INACTIVE_TEAM_JSON="$(register "$INACTIVE_TEAM" employer 'Lifecycle Inactive Team')"
ADMIN_JSON="$(register "$ADMIN" employer 'Lifecycle Admin')"

STUDENT_ONE_TOKEN="$(json_value "$STUDENT_ONE_JSON" "payload['token']")"
STUDENT_TWO_TOKEN="$(json_value "$STUDENT_TWO_JSON" "payload['token']")"
STUDENT_THREE_TOKEN="$(json_value "$STUDENT_THREE_JSON" "payload['token']")"
OWNER_TOKEN="$(json_value "$OWNER_JSON" "payload['token']")"
FOREIGN_TOKEN="$(json_value "$FOREIGN_JSON" "payload['token']")"
TEAM_TOKEN="$(json_value "$TEAM_JSON" "payload['token']")"
INACTIVE_TEAM_TOKEN="$(json_value "$INACTIVE_TEAM_JSON" "payload['token']")"

(
  cd "$ROOT_DIR"
  printf 'UPDATE "User" SET "role" = '"'"'admin'"'"' WHERE "email" = '"'"'%s'"'"';\n' "$ADMIN" |
    pnpm --filter api exec prisma db execute --schema=prisma/schema.prisma --stdin >/dev/null
)
ADMIN_JSON="$(curl -sS -X POST "$BASE/api/v1/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN\",\"password\":\"$PASSWORD\"}")"
ADMIN_TOKEN="$(json_value "$ADMIN_JSON" "payload['token']")"

(
  cd "$ROOT_DIR"
  printf 'INSERT INTO "TeamMember" ("id","employerId","name","email","role","status","createdAt","updatedAt") SELECT '"'"'team-%s'"'"', e."id", '"'"'Active Team Member'"'"', '"'"'%s'"'"', '"'"'recruiter'"'"', '"'"'active'"'"', NOW(), NOW() FROM "Employer" e JOIN "User" u ON u."id" = e."userId" WHERE u."email" = '"'"'%s'"'"';\n' "$STAMP" "$TEAM" "$OWNER" |
    pnpm --filter api exec prisma db execute --schema=prisma/schema.prisma --stdin >/dev/null
)
(
  cd "$ROOT_DIR"
  printf 'INSERT INTO "TeamMember" ("id","employerId","name","email","role","status","createdAt","updatedAt") SELECT '"'"'inactive-team-%s'"'"', e."id", '"'"'Invited Team Member'"'"', '"'"'%s'"'"', '"'"'recruiter'"'"', '"'"'invited'"'"', NOW(), NOW() FROM "Employer" e JOIN "User" u ON u."id" = e."userId" WHERE u."email" = '"'"'%s'"'"';\n' "$STAMP" "$INACTIVE_TEAM" "$OWNER" |
    pnpm --filter api exec prisma db execute --schema=prisma/schema.prisma --stdin >/dev/null
)

PROJECT_JSON="$(curl -sS -X POST "$BASE/api/v1/projects" -H "Authorization: Bearer $OWNER_TOKEN" -H 'Content-Type: application/json' -d "{\"title\":\"Lifecycle opportunity $STAMP\",\"description\":\"A detailed opportunity used only by the lifecycle contract test.\",\"type\":\"internship\",\"skillsRequired\":[\"TypeScript\"],\"remote\":true}")"
PROJECT_ID="$(json_value "$PROJECT_JSON" "payload['project']['id']")"

apply() {
  curl -sS -X POST "$BASE/api/v1/projects/$PROJECT_ID/apply" \
    -H "Authorization: Bearer $1" -H 'Content-Type: application/json' \
    -d '{"coverLetter":"Lifecycle test application","proposedBudget":400}'
}
APP_ONE_JSON="$(apply "$STUDENT_ONE_TOKEN")"
APP_TWO_JSON="$(apply "$STUDENT_TWO_TOKEN")"
APP_THREE_JSON="$(apply "$STUDENT_THREE_TOKEN")"
APP_ONE_ID="$(json_value "$APP_ONE_JSON" "payload['application']['id']")"
APP_TWO_ID="$(json_value "$APP_TWO_JSON" "payload['application']['id']")"
APP_THREE_ID="$(json_value "$APP_THREE_JSON" "payload['application']['id']")"

STATUS="$(request PATCH "$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_ONE_ID" "$STUDENT_ONE_TOKEN" '{"status":"reviewing"}')"
assert_status "student cannot transition an employer application" 403 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_ONE_ID" "$FOREIGN_TOKEN" '{"status":"reviewing"}')"
assert_status "foreign employer cannot transition an application" 403 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_ONE_ID" "$INACTIVE_TEAM_TOKEN" '{"status":"reviewing"}')"
assert_status "invited team member cannot transition an application" 403 "$STATUS"
STATUS="$(request GET "$BASE/api/v1/projects/$PROJECT_ID/applications" "$TEAM_TOKEN")"
assert_status "active team member can view employer applicants" 200 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_ONE_ID" "$TEAM_TOKEN" '{"status":"reviewing","reviewNote":"Private note","candidateFeedback":"Portfolio is a strong match."}')"
REVIEW_JSON="$(< /tmp/skillbridge-lifecycle-response.json)"
assert_status "active team member can review an application" 200 "$STATUS"
assert_json "transition audit records previous and next state" "payload['transition']['previousStatus'] == 'pending' and payload['transition']['newStatus'] == 'reviewing'" "$REVIEW_JSON"

STUDENT_APPS="$(curl -sS "$BASE/api/v1/projects/student/applications" -H "Authorization: Bearer $STUDENT_ONE_TOKEN")"
assert_json "student sees candidate feedback but not internal notes" "payload['applications'][0]['candidateFeedback'] == 'Portfolio is a strong match.' and 'reviewNote' not in payload['applications'][0]" "$STUDENT_APPS"

STATUS="$(request PATCH "$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_ONE_ID" "$OWNER_TOKEN" '{"status":"shortlisted"}')"
assert_status "owner can shortlist an application" 200 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_ONE_ID" "$OWNER_TOKEN" '{"status":"accepted"}')"
assert_status "owner can accept a shortlisted application" 200 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_ONE_ID" "$OWNER_TOKEN" '{"status":"hired"}')"
assert_status "owner can hire an accepted candidate" 200 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_ONE_ID" "$OWNER_TOKEN" '{"status":"rejected"}')"
assert_status "terminal application rejects further transitions" 400 "$STATUS"

STATUS="$(request PATCH "$BASE/api/v1/projects/student/applications/$APP_TWO_ID/withdraw" "$STUDENT_ONE_TOKEN")"
assert_status "student cannot withdraw another student's application" 404 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/projects/student/applications/$APP_TWO_ID/withdraw" "$STUDENT_TWO_TOKEN")"
assert_status "application owner can withdraw an active application" 200 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/projects/student/applications/$APP_TWO_ID/withdraw" "$STUDENT_TWO_TOKEN")"
assert_status "withdrawal is blocked after terminal state" 400 "$STATUS"

CONCURRENT_URL="$BASE/api/v1/projects/$PROJECT_ID/applications/$APP_THREE_ID"
(
  curl -sS -o /tmp/lifecycle-one.json -w '%{http_code}' -X PATCH "$CONCURRENT_URL" -H "Authorization: Bearer $OWNER_TOKEN" -H 'Content-Type: application/json' -d '{"status":"reviewing"}'
) > /tmp/lifecycle-one.status & P1=$!
(
  curl -sS -o /tmp/lifecycle-two.json -w '%{http_code}' -X PATCH "$CONCURRENT_URL" -H "Authorization: Bearer $OWNER_TOKEN" -H 'Content-Type: application/json' -d '{"status":"reviewing"}'
) > /tmp/lifecycle-two.status & P2=$!
wait "$P1"; wait "$P2"
ONE="$(< /tmp/lifecycle-one.status)"; TWO="$(< /tmp/lifecycle-two.status)"
assert_json "concurrent transitions allow one winner and one conflict" "sorted(['$ONE', '$TWO']) == ['200', '409']" '{}'
CONCURRENT_AUDIT="$(audit_counts "$APP_THREE_ID")"
assert_json "concurrent transitions create one history row, one status event, and one notification" "payload == {'history': 1, 'events': 2, 'notifications': 1}" "$CONCURRENT_AUDIT"

STATUS="$(request GET "$BASE/api/v1/users/notifications" "$STUDENT_ONE_TOKEN")"
NOTIFICATIONS="$(< /tmp/skillbridge-lifecycle-response.json)"
assert_status "student can read own notifications" 200 "$STATUS"
assert_json "notifications contain no internal review note" "all('reviewNote' not in n and 'candidateFeedback' not in n for n in payload['notifications'])" "$NOTIFICATIONS"
NOTIFICATION_ID="$(json_value "$NOTIFICATIONS" "payload['notifications'][0]['id']")"
STATUS="$(request PATCH "$BASE/api/v1/users/notifications/$NOTIFICATION_ID/read" "$STUDENT_ONE_TOKEN")"
assert_status "student can mark their notification as read" 200 "$STATUS"
STATUS="$(request PATCH "$BASE/api/v1/users/notifications/$NOTIFICATION_ID/read" "$STUDENT_TWO_TOKEN")"
assert_status "student cannot mark another student's notification as read" 404 "$STATUS"

STATUS="$(request GET "$BASE/api/v1/analytics/employer/analytics" "$OWNER_TOKEN")"
ANALYTICS="$(< /tmp/skillbridge-lifecycle-response.json)"
assert_status "owner can read hiring analytics" 200 "$STATUS"
assert_json "analytics exposes mutually exclusive status counts" "payload['semantics']['stageCounts'] == 'mutually_exclusive_current_status_counts' and sum(payload['stageCounts'].values()) == payload['funnel']['applied']" "$ANALYTICS"

printf '\n== Result: %d passed, %d failed ==\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
