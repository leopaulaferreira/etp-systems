# Deploy automático do ETP

Um push em `main` aciona [o workflow](../../.github/workflows/deploy.yml). O GitHub testa e compila Java 21 e Node 24, compara as videoaulas com as já publicadas e envia somente os arquivos alterados para a VM. A VM não executa Maven nem Vite. O banco MySQL e `/opt/etp-systems/.env` não são substituídos.

A etapa de publicação roda `/usr/local/sbin/etp-activate` com um usuário SSH dedicado. Antes de trocar a versão, o script salva o JAR, o `index.html` e um dump do MySQL em `/opt/etp-systems/releases/<commit>/`. Depois reinicia só a API, verifica `https://etp.leofe.com.br/api/cursos` e restaura o JAR e a página anteriores se a API não responder. Migrações de banco já aplicadas não são revertidas automaticamente; o dump fica disponível para recuperação manual.

O ambiente GitHub `production` permite apenas `main` e guarda `ETP_DEPLOY_KEY` e `ETP_KNOWN_HOSTS`. A chave SSH correspondente só acessa o usuário `etpdeploy` na VM, sem senha nem grupo Docker. Esse usuário pode enviar arquivos para sua área de entrada e vídeos; o `sudo` é restrito ao script de ativação.

Para acompanhar: abra **Actions → Deploy ETP** no repositório. `workflow_dispatch` permite repetir uma publicação manualmente. O primeiro deploy pode demorar mais para preencher os caches do GitHub; o reinício da API na VM de 1 GB costuma levar alguns minutos. Em falha, consulte os logs da execução e a pasta de backup do commit na VM antes de tentar novamente.

## Configuração dos arquivos estáticos

[frontend.nginx.conf](frontend.nginx.conf) é a configuração do container `etp-frontend`.
Ela ativa gzip para arquivos de texto e cache de um ano para os arquivos com hash
em `/assets/`. O HTML e arquivos sem hash usam `no-cache`: o navegador pode guardar
uma cópia, mas precisa revalidá-la antes de reutilizar. As videoaulas mantêm o suporte
a requisições parciais e não recebem gzip. As respostas da API são atendidas pelo
proxy separado e não são modificadas por esta configuração.

O workflow publica o build, mas não instala configurações de infraestrutura.
Quando for publicar esta configuração, envie o arquivo para a VM com a conta
administrativa e aplique-o ao arquivo já montado no container:

```bash
scp -i ~/.ssh/oracle-jan29-2.key deploy/oracle/frontend.nginx.conf \
  ubuntu@147.15.127.35:/tmp/etp-frontend.nginx.conf

ssh -i ~/.ssh/oracle-jan29-2.key ubuntu@147.15.127.35 'bash -s' <<'REMOTE'
set -euo pipefail
config=/opt/etp-systems/frontend.nginx.conf
backup=$(sudo mktemp /opt/etp-systems/frontend.nginx.conf.backup.XXXXXX)
sudo cp "$config" "$backup"
# Escrever no arquivo existente preserva o bind mount do container.
sudo tee "$config" < /tmp/etp-frontend.nginx.conf > /dev/null
if sudo docker exec etp-frontend nginx -t && sudo docker exec etp-frontend nginx -s reload; then
  rm /tmp/etp-frontend.nginx.conf
else
  sudo cat "$backup" | sudo tee "$config" > /dev/null
  sudo docker exec etp-frontend nginx -t
  sudo docker exec etp-frontend nginx -s reload
  exit 1
fi
REMOTE
```

Esse procedimento recarrega apenas o Nginx do frontend. Confira os cabeçalhos
`Content-Encoding: gzip` e `Vary: Accept-Encoding` de um JavaScript solicitando
`Accept-Encoding: gzip`; confira também `Cache-Control` no JavaScript e no HTML.
Um arquivo ausente em `/assets/` deve retornar 404 sem cache de um ano.
