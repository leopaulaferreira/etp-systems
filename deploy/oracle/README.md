# MySQL do ETP em uma VM com pouca memória

Este Compose inicia somente o MySQL 8.4.11. O frontend e o backend exigem uma
implantação separada. Ele não substitui o Compose de desenvolvimento da raiz.

## Configuração

Na VM, a instalação usa `/opt/etp-systems/database/compose.yml` e um `.env`
protegido (permissões 600), com `DB_PASSWORD` e `DB_ROOT_PASSWORD` distintas.
Não versionar esse arquivo nem copiar senhas para comandos ou documentação.

O banco `etp_db` e o usuário `etp_user` são criados na primeira inicialização.
A porta é publicada apenas em `127.0.0.1:3307`. Um backend no host usa esse endereço;
um backend em container precisa participar da rede `etp-database_default` e usar
`database:3306`. O MySQL não deve ser publicado na internet.

```bash
sudo docker compose --env-file /opt/etp-systems/database/.env \
  -f /opt/etp-systems/database/compose.yml up -d --wait
```

O limite é de 384 MiB de RAM e 768 MiB de RAM + swap. O host precisa dispor de swap
para usar a segunda parcela; isso não representa RAM adicional. O pool InnoDB é
64 MiB, o Performance Schema está desativado e o limite é de 20 conexões. Essas
escolhas reduzem caches e observabilidade em favor do consumo menor.

No backend desta instalação, usar inicialmente:

```text
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=3
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
```

Uma suíte que abre vários contextos Spring precisa dos mesmos limites de pool.
As 67 verificações de backend passaram com esta configuração de memória e pool,
em um container local separado. Isso não substitui teste de carga da VM.

## Migração e reversão

Antes da troca, guardar um dump completo do MySQL antigo, outro apenas dos bancos
de aplicação e uma cópia de `/etc/mysql` em um diretório de backup acessível apenas
a root. Restaurar apenas os bancos de aplicação no MySQL 8.4; não importar as
tabelas de sistema do MySQL 8.0. Conferir o conteúdo restaurado.

A migração mantém os dados do serviço antigo no disco e desabilita
`mysql.service`. As contas antigas de acesso remoto não são recriadas: os bancos
legados preservados ficam acessíveis a root para recuperação. O usuário `etp_user`
tem acesso somente ao banco do ETP.

Para reverter a troca antes de colocar o ETP em produção:

```bash
sudo docker compose --env-file /opt/etp-systems/database/.env \
  -f /opt/etp-systems/database/compose.yml stop
sudo systemctl enable --now mysql
```

Isso reativa a configuração antiga, inclusive suas regras de exposição de rede;
revise o firewall e o endereço de escuta antes de usá-la. Não executar `down -v`,
apagar `/var/lib/mysql` nem desinstalar o serviço antigo até validar os consumidores
e definir a retenção dos backups. Se houver novas gravações no banco Docker,
faça backup delas antes de qualquer reversão: não são copiadas ao banco antigo.
