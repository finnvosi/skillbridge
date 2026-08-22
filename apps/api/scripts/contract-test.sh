#!/usr/bin/env bash
# SkillBridge API contract test — exercises the core endpoints against a
# running server (default http://localhost:3001). Exits non-zero on any failure.
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3001}"
PASS=0
FAIL=0

assert() {
  local desc="$1"; local cond="$2"
  if [ "$cond" = "true" ]; then
    echo "  ✅ $desc"; PASS=$((PASS+1))
  else
    echo "  ❌ $desc"; FAIL=$((FAIL+1))
  fi
}

echo "== SkillBridge API contract test ($BASE) =="

# 1. Health
HEALTH=$(curl -s "$BASE/health")
assert "health endpoint returns ok" "$(echo "$HEALTH" | grep -q '"status":"ok"' && echo true || echo false)"

# 2. Register a student
TS=$(date +%s)
EMAIL="student_$TS@test.kh"
REG=$(curl -s -X POST "$BASE/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123!\",\"name\":\"Test Student\",\"role\":\"student\"}")
assert "register student returns token" "$(echo "$REG" | grep -q '"token"' && echo true || echo false)"

# 3. Login
LOGIN=$(curl -s -X POST "$BASE/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123!\"}")
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null || true)
assert "login returns token" "$([ -n "$TOKEN" ] && echo true || echo false)"

AUTH="Authorization: Bearer $TOKEN"

# 4. /auth/me
ME=$(curl -s "$BASE/api/v1/auth/me" -H "$AUTH")
assert "auth/me returns the registered email" "$(echo "$ME" | grep -q "$EMAIL" && echo true || echo false)"

# 5. List projects (seeded) — requires auth
PROJ=$(curl -s "$BASE/api/v1/projects" -H "$AUTH")
assert "projects list returns array" "$(echo "$PROJ" | python3 -c "import sys,json;d=json.load(sys.stdin);print('true' if isinstance(d,dict) and 'projects' in d else 'false')" 2>/dev/null || echo false)"

# 6. Seeded projects present (assert at least one exists; titles rotate with seed data)
assert "seeded projects exist" "$(echo "$PROJ" | python3 -c "import sys,json;d=json.load(sys.stdin);print('true' if isinstance(d,dict) and d.get('projects') and len(d['projects'])>0 else 'false')" 2>/dev/null || echo false)"

# 7. Student applies to first OPEN project
PID=$(echo "$PROJ" | python3 -c "import sys,json;d=json.load(sys.stdin);ps=d.get('projects',[]);open_p=next((p for p in ps if p.get('status')=='open'),None);print(open_p['id'] if open_p else (ps[0]['id'] if ps else ''))" 2>/dev/null || true)
if [ -n "$PID" ]; then
  APP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/projects/$PID/apply" \
    -H "$AUTH" -H 'Content-Type: application/json' \
    -d '{"coverLetter":"Test application"}')
  assert "student can apply to an open project (200/201)" "$([ "$APP" = "200" ] || [ "$APP" = "201" ] && echo true || echo false)"
fi

# 8. Employer-only endpoint rejected for student
EMP_REJECT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/projects" -X POST \
  -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"title":"x","description":"y","type":"freelance"}')
assert "student cannot create project (401/403)" "$([ "$EMP_REJECT" = "401" ] || [ "$EMP_REJECT" = "403" ] && echo true || echo false)"

echo ""
echo "== Result: $PASS passed, $FAIL failed =="
[ "$FAIL" -eq 0 ]
