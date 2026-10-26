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

# Comparar o conteúdo versionado evita diferenças de timestamp entre builds do JAR.
# Pacotes antigos sem marcador continuam fazendo a publicação completa.
backend_changed=true
backend_source=''
if [[ -f $stage/backend-source ]]; then
  backend_source=$(cat "$stage/backend-source")
  [[ $backend_source =~ ^[0-9a-f]{40}$ ]] || { echo 'Identificador do backend inválido.' >&2; exit 1; }
  if [[ -f $app/backend-source && $(cat "$app/backend-source") == "$backend_source" ]]; then
    backend_changed=false
  fi
fi

install -d -m 700 "$backup"
cp "$app/frontend/index.html" "$backup/index.html"
if [[ $backend_changed == true ]]; then
  cp "$app/etp-backend.jar" "$backup/etp-backend.jar"
  # O banco permanece no volume Docker. O dump permite recuperar dados antes de migrations novas.
  docker exec etp-database sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --single-transaction --no-tablespaces -u"$MYSQL_USER" "$MYSQL_DATABASE"' \
    | gzip -1 > "$backup/database.sql.gz"
  gzip -t "$backup/database.sql.gz"
fi

# Arquivos versionados entram primeiro; o index troca por último. Vídeos são sincronizados à parte.
rsync -a --no-owner --no-group --exclude='/index.html' --exclude='/videos/***' "$web/" "$app/frontend/"
install -m 644 "$web/index.html" "$app/frontend/index.html.next"
mv -f "$app/frontend/index.html.next" "$app/frontend/index.html"
if [[ $backend_changed == true ]]; then
  install -m 644 "$stage/etp-backend.jar" "$app/etp-backend.jar.next"
  mv -f "$app/etp-backend.jar.next" "$app/etp-backend.jar"

  "${compose[@]}" up -d --force-recreate --no-deps backend
else
  echo "Backend sem alterações; mantendo a API em execução."
fi

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
  echo 'API não respondeu; restaurando a versão anterior.' >&2
  if [[ $backend_changed == true ]]; then
    install -m 644 "$backup/etp-backend.jar" "$app/etp-backend.jar.next"
    mv -f "$app/etp-backend.jar.next" "$app/etp-backend.jar"
    "${compose[@]}" up -d --force-recreate --no-deps backend
  fi
  install -m 644 "$backup/index.html" "$app/frontend/index.html.next"
  mv -f "$app/frontend/index.html.next" "$app/frontend/index.html"
  exit 1
fi

if [[ -n $backend_source ]]; then
  printf '%s\n' "$backend_source" > "$app/backend-source"
else
  rm -f "$app/backend-source"
fi
printf '%s\n' "$sha" > "$app/deployed-commit"
echo "Implantação concluída: $sha"
# O código enviado já está em uso; só o backup do banco/JAR fica para reversão.
rm -rf -- "$stage"
