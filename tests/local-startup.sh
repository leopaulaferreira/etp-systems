#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_DIR="$(mktemp -d)"
trap 'rm -rf -- "$TEST_DIR"' EXIT
mkdir -p "$TEST_DIR/project/backend" "$TEST_DIR/bin"
cp "$ROOT_DIR/etp" "$TEST_DIR/project/etp"
cp "$ROOT_DIR/docker-compose.yml" "$TEST_DIR/project/docker-compose.yml"
export ETP_ENV_FILE="$TEST_DIR/project/backend/.env"
export DOCKER_CALLS="$TEST_DIR/docker-calls"
cat > "$TEST_DIR/bin/docker" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$DOCKER_CALLS"
case " $* " in
  ' info ') exit "${FAIL_DOCKER:-0}" ;;
  *' config --quiet '*) exit "${FAIL_CONFIG:-0}" ;;
  *' up '*) exit "${FAIL_UP:-0}" ;;
  *' port frontend 5173 '*) echo '127.0.0.1:5174' ;;
  *' port backend 8080 '*) echo '127.0.0.1:18080' ;;
esac
MOCK
chmod +x "$TEST_DIR/bin/docker"
export PATH="$TEST_DIR/bin:$PATH"
cd "$TEST_DIR/project"
./etp configurar > "$TEST_DIR/output"
test -f "$ETP_ENV_FILE"
grep -Eq '^JWT_SECRET=[0-9a-f]{64}$' "$ETP_ENV_FILE"
grep -Eq '^ETP_DEMO_PASSWORD=[0-9a-f]{24}$' "$ETP_ENV_FILE"
cp "$ETP_ENV_FILE" "$TEST_DIR/original"
./etp configurar >> "$TEST_DIR/output"
cmp "$ETP_ENV_FILE" "$TEST_DIR/original"
./etp iniciar > "$TEST_DIR/output"
grep -q 'ETP Systems pronto' "$TEST_DIR/output"
grep -q 'http://127.0.0.1:5174' "$TEST_DIR/output"
grep -q -- '--wait --wait-timeout 300' "$DOCKER_CALLS"
./etp parar > "$TEST_DIR/output"
grep -q ' stop$' "$DOCKER_CALLS"
if grep -Eq ' down|--volumes| -v ' "$DOCKER_CALLS"; then echo 'Parada destrutiva detectada' >&2; exit 1; fi
# Um .env não é um script executável.
printf 'UNUSED=$(touch %s)\n' "$TEST_DIR/should-not-exist" >> "$ETP_ENV_FILE"
./etp status > "$TEST_DIR/output"
test ! -e "$TEST_DIR/should-not-exist"
if FAIL_UP=1 ./etp iniciar > "$TEST_DIR/output" 2>&1; then exit 1; fi
if grep -q 'ETP Systems pronto' "$TEST_DIR/output"; then exit 1; fi
grep -q 'Não foi possível' "$TEST_DIR/output"
if FAIL_DOCKER=1 ./etp iniciar > "$TEST_DIR/output" 2>&1; then exit 1; fi
grep -q 'Docker não está disponível' "$TEST_DIR/output"
if FAIL_CONFIG=1 ./etp iniciar > "$TEST_DIR/output" 2>&1; then exit 1; fi
grep -q 'campos obrigatórios' "$TEST_DIR/output"
cp "$DOCKER_CALLS" "$TEST_DIR/calls-before-invalid"
if ./etp logs --volumes > "$TEST_DIR/output" 2>&1; then exit 1; fi
cmp "$DOCKER_CALLS" "$TEST_DIR/calls-before-invalid"
printf 'Verificações de configuração, início, parada e tratamento de erros passaram.\n'
