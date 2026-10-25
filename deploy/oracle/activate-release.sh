#!/usr/bin/env bash
set -Eeuo pipefail

sha=${1:-}
if [[ ! $sha =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Commit inválido para implantação.' >&2
  exit 2
fi

exec 9>/run/lock/etp-deploy.lock
flock -n 9 || { echo 'Já existe uma implantação em andamento.' >&2; exit 1; }

app=/opt/etp-systems
stage=/home/etpdeploy/incoming/$sha
web=$stage/frontend
backup=$app/releases/$sha
compose=(docker compose --project-directory "$app" -f "$app/docker-compose.yml" --env-file "$app/.env")

[[ -f $stage/etp-backend.jar && -s $stage/etp-backend.jar ]] || { echo 'JAR ausente.' >&2; exit 1; }
[[ -f $web/index.html && -d $web/assets ]] || { echo 'Frontend incompleto.' >&2; exit 1; }
[[ ! -L $stage && ! -L $web && ! -L $stage/etp-backend.jar ]] || { echo 'Links não permitidos no pacote.' >&2; exit 1; }
[[ -z $(find "$stage" -type l -print -quit) ]] || { echo 'Links não permitidos no pacote.' >&2; exit 1; }
[[ $(stat -c %U "$stage") == etpdeploy ]] || { echo 'Dono do pacote inválido.' >&2; exit 1; }

if [[ -f $app/deployed-commit && $(cat "$app/deployed-commit") == "$sha" ]]; then
  echo "Commit $sha já implantado."
  exit 0
fi

install -d -m 700 "$backup"
cp "$app/etp-backend.jar" "$backup/etp-backend.jar"
cp "$app/frontend/index.html" "$backup/index.html"
# O banco permanece no volume Docker. O dump permite recuperar dados antes de migrations novas.
docker exec etp-database sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --single-transaction --no-tablespaces -u"$MYSQL_USER" "$MYSQL_DATABASE"' \
  | gzip -1 > "$backup/database.sql.gz"
gzip -t "$backup/database.sql.gz"

# Arquivos versionados entram primeiro; o index troca por último. Vídeos são sincronizados à parte.
rsync -a --no-owner --no-group --exclude='/index.html' --exclude='/videos/***' "$web/" "$app/frontend/"
install -m 644 "$web/index.html" "$app/frontend/index.html.next"
mv -f "$app/frontend/index.html.next" "$app/frontend/index.html"
install -m 644 "$stage/etp-backend.jar" "$app/etp-backend.jar.next"
mv -f "$app/etp-backend.jar.next" "$app/etp-backend.jar"

"${compose[@]}" up -d --force-recreate --no-deps backend

healthy=false
for ((attempt=1; attempt<=36; attempt++)); do
  if curl --fail --silent --max-time 6 --resolve etp.leofe.com.br:443:127.0.0.1 \
    https://etp.leofe.com.br/api/cursos >/dev/null; then
    healthy=true
    break
  fi
  sleep 10
done

if [[ $healthy != true ]]; then
  echo 'Nova API não respondeu; restaurando JAR e página anterior.' >&2
  install -m 644 "$backup/etp-backend.jar" "$app/etp-backend.jar.next"
  mv -f "$app/etp-backend.jar.next" "$app/etp-backend.jar"
  install -m 644 "$backup/index.html" "$app/frontend/index.html.next"
  mv -f "$app/frontend/index.html.next" "$app/frontend/index.html"
  "${compose[@]}" up -d --force-recreate --no-deps backend
  exit 1
fi

printf '%s\n' "$sha" > "$app/deployed-commit"
echo "Implantação concluída: $sha"
# O código enviado já está em uso; só o backup do banco/JAR fica para reversão.
rm -rf -- "$stage"
