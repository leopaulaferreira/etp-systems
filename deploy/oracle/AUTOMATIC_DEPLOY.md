# Deploy automático do ETP

Um push em `main` aciona [o workflow](../../.github/workflows/deploy.yml). O GitHub testa e compila Java 21 e Node 24, executa os testes de integração com um MySQL 8.4 temporário no runner (com `ETP_DB_TEST=true`), compara as videoaulas com as já publicadas e envia somente os arquivos alterados para a VM. A VM não executa Maven nem Vite. O banco MySQL e `/opt/etp-systems/.env` não são substituídos.

A etapa de publicação roda `/usr/local/sbin/etp-activate` com um usuário SSH dedicado. O pacote inclui `backend-source`, com o identificador Git do conteúdo da pasta `backend`. O script compara esse identificador com a última versão publicada com sucesso. Se o backend mudou, salva o JAR, o `index.html` e um dump do MySQL em `/opt/etp-systems/releases/<commit>/` e reinicia só a API. Quando muda apenas o frontend, salva o `index.html` e publica a interface sem reiniciar a API nem gerar um dump. Em ambos os casos, verifica `https://etp.leofe.com.br/api/cursos` e restaura a página anterior se a API não responder; quando houve atualização do backend, restaura também o JAR. Migrações de banco já aplicadas não são revertidas automaticamente; o dump fica disponível para recuperação manual.

Na primeira publicação sem um identificador anterior, a API é atualizada normalmente. Pacotes antigos sem `backend-source` também continuam fazendo uma publicação completa. O marcador só é atualizado após a verificação de saúde. Alterações em testes ou documentação dentro de `backend` também contam como mudanças do backend.

O MySQL dos testes usa credenciais descartáveis e não acessa o banco da VM. Uma falha nos testes interrompe o workflow antes do envio dos arquivos. Os cenários de ativação e reversão são verificados por `python3 tests/deploy-activation.py`.

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

## Atualização do script de ativação

O workflow não substitui o script privilegiado da VM. Após alterar
`activate-release.sh`, instale a versão revisada usando a conta administrativa:

```bash
scp -i ~/.ssh/oracle-jan29-2.key deploy/oracle/activate-release.sh \
  ubuntu@147.15.127.35:/tmp/activate-release.sh
ssh -i ~/.ssh/oracle-jan29-2.key ubuntu@147.15.127.35 'bash -s' <<'REMOTE'
set -euo pipefail
sudo bash -n /tmp/activate-release.sh
backup=$(sudo mktemp /usr/local/sbin/etp-activate.backup.XXXXXX)
sudo cp /usr/local/sbin/etp-activate "$backup"
sudo install -o root -g root -m 755 /tmp/activate-release.sh /usr/local/sbin/etp-activate.next
sudo mv /usr/local/sbin/etp-activate.next /usr/local/sbin/etp-activate
rm /tmp/activate-release.sh
REMOTE
```
