#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Use the installed Homebrew JDK when macOS has no system JDK configured.
if [[ -z "${JAVA_HOME:-}" && -d /opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home ]]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home
  export PATH="$JAVA_HOME/bin:$PATH"
fi
for dependency in java mvn npm curl; do
  command -v "$dependency" >/dev/null || { echo "Missing dependency: $dependency" >&2; exit 1; }
done
mkdir -p .local
if [[ -z "${DATABASE_URL:-}" ]]; then
  for dependency in pg_isready initdb pg_ctl psql; do
    command -v "$dependency" >/dev/null || { echo "Install PostgreSQL or set DATABASE_URL, DATABASE_USER and DATABASE_PASSWORD." >&2; exit 1; }
  done
  # The project-local database uses a separate port from system PostgreSQL.
  if ! pg_isready -h 127.0.0.1 -p 55432 -q; then
    if [[ ! -f .local/postgres/PG_VERSION ]]; then
      initdb -D .local/postgres -U mangaforum --auth-local=trust --auth-host=trust >/dev/null
    fi
    pg_ctl -D .local/postgres -l .local/postgres.log -o "-h 127.0.0.1 -p 55432" start
  fi
  if ! psql -h 127.0.0.1 -p 55432 -U mangaforum -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='mangaforum'" | grep -q 1; then
    createdb -h 127.0.0.1 -p 55432 -U mangaforum mangaforum
  fi
  export DATABASE_URL=jdbc:postgresql://127.0.0.1:55432/mangaforum
fi
export DATABASE_USER="${DATABASE_USER:-mangaforum}"
export DATABASE_PASSWORD="${DATABASE_PASSWORD:-local-development-only}"
export BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8080}"

backend_pid=""
frontend_pid=""
cleanup() {
  [[ -z "$frontend_pid" ]] || kill "$frontend_pid" 2>/dev/null || true
  [[ -z "$backend_pid" ]] || kill "$backend_pid" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT TERM
if ! curl -fsS --max-time 2 "$BACKEND_URL/api/health" >/dev/null 2>&1; then
  mvn -f backend/pom.xml clean spring-boot:run > .local/backend.log 2>&1 &
  backend_pid=$!
  ready=false
  for ((attempt=0; attempt<120; attempt++)); do
    if curl -fsS --max-time 2 "$BACKEND_URL/api/health" >/dev/null 2>&1; then ready=true; break; fi
    if ! kill -0 "$backend_pid" 2>/dev/null; then cat .local/backend.log; exit 1; fi
    sleep 1
  done
  if [[ "$ready" != true ]]; then tail -40 .local/backend.log; exit 1; fi
fi
printf 'Catalog API ready: %s/api/manga\n' "$BACKEND_URL"
npm --prefix frontend run dev -- --webpack &
frontend_pid=$!
wait "$frontend_pid"
