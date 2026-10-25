# Deploy automático do ETP

Um push em `main` aciona [o workflow](../../.github/workflows/deploy.yml). O GitHub testa e compila Java 21 e Node 24, compara as videoaulas com as já publicadas e envia somente os arquivos alterados para a VM. A VM não executa Maven nem Vite. O banco MySQL e `/opt/etp-systems/.env` não são substituídos.

A etapa de publicação roda `/usr/local/sbin/etp-activate` com um usuário SSH dedicado. Antes de trocar a versão, o script salva o JAR, o `index.html` e um dump do MySQL em `/opt/etp-systems/releases/<commit>/`. Depois reinicia só a API, verifica `https://etp.leofe.com.br/api/cursos` e restaura o JAR e a página anteriores se a API não responder. Migrações de banco já aplicadas não são revertidas automaticamente; o dump fica disponível para recuperação manual.

O ambiente GitHub `production` permite apenas `main` e guarda `ETP_DEPLOY_KEY` e `ETP_KNOWN_HOSTS`. A chave SSH correspondente só acessa o usuário `etpdeploy` na VM, sem senha nem grupo Docker. Esse usuário pode enviar arquivos para sua área de entrada e vídeos; o `sudo` é restrito ao script de ativação.

Para acompanhar: abra **Actions → Deploy ETP** no repositório. `workflow_dispatch` permite repetir uma publicação manualmente. O primeiro deploy pode demorar mais para preencher os caches do GitHub; o reinício da API na VM de 1 GB costuma levar alguns minutos. Em falha, consulte os logs da execução e a pasta de backup do commit na VM antes de tentar novamente.
