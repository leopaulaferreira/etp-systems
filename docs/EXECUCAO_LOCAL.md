# Executar o ETP Systems localmente

## Pré-requisitos

- Docker em execução, com Docker Compose v2.20 ou mais recente (Docker Desktop já inclui).
- Bash: terminal no Linux/macOS ou WSL2 integrado ao Docker Desktop no Windows.
- OpenSSL para gerar a configuração automaticamente. Alternativa: copiar `backend/.env.example` para `backend/.env` e preencher os campos vazios.
- Internet na primeira execução para baixar imagens e dependências.

Java, Maven, Node e MySQL rodam nos containers; não é preciso instalá-los no computador.

## Iniciar

Na pasta do projeto:

```sh
./etp iniciar
```

Na primeira execução, se `backend/.env` não existir, o comando gera senhas locais, habilita as contas de demonstração e os dados ilustrativos do RH. Se o arquivo já existir, ele é preservado. O comando aguarda banco, API e frontend ficarem prontos e mostra os endereços efetivos.

Com a configuração gerada, acesse **http://127.0.0.1:5174**. API: `http://127.0.0.1:18080`; Swagger: `http://127.0.0.1:18080/swagger-ui/index.html`. O MySQL usa a porta local `3307`. As portas ficam acessíveis apenas neste computador.

A primeira inicialização demora mais por causa dos downloads e da compilação. As migrações do banco são aplicadas automaticamente. Não execute `database/schema.sql` manualmente.

## Contas de demonstração

| Perfil escolhido no login | E-mail padrão |
| --- | --- |
| Colaborador | `etp@gmail.com` |
| Empresa / RH | `rhetp@gmail.com` |

Abra `backend/.env`: a senha inicial das duas contas é o valor de `ETP_DEMO_PASSWORD`. Os e-mails também podem ser configurados nesse arquivo. As credenciais não são impressas nos logs do comando nem entram no Git.

Em uma configuração anterior, as contas só serão criadas se `SPRING_PROFILES_ACTIVE=dev`, `ETP_DEMO_ENABLED=true` e `ETP_DEMO_PASSWORD` estiver preenchida. Para os oito colaboradores ilustrativos, use também `ETP_DEMO_COMPANY_DATA_ENABLED=true`.

Reiniciar não redefine senhas de contas existentes. Mudar `ETP_DEMO_PASSWORD` no arquivo não altera a senha de uma conta que já foi criada. Use a senha anterior nesse caso.

## Parar e consultar

```sh
./etp parar          # Para os três serviços sem apagar o banco
./etp iniciar        # Inicia novamente e incorpora alterações do código
./etp status         # Mostra containers e estado de saúde
./etp logs backend   # Acompanha os logs da API
./etp logs frontend  # Acompanha os logs do frontend
./etp logs database  # Acompanha os logs do banco
```

`Ctrl+C` ao acompanhar logs encerra somente a visualização. O banco, as inscrições, as tentativas e os certificados ficam no volume Docker entre reinicializações. Mantenha a pasta/nome do projeto para reutilizar o mesmo volume.

## Problemas comuns

- **Porta ocupada:** ajuste `ETP_FRONTEND_PORT`, `ETP_BACKEND_PORT` ou `DB_PORT` em `backend/.env` e execute `./etp iniciar` novamente. O proxy entre frontend e API é configurado pelo Compose, independentemente das portas externas.
- **Docker indisponível:** abra o Docker Desktop ou inicie o serviço Docker e confira o acesso do seu usuário. No Windows, habilite a integração com sua distribuição WSL2.
- **Credencial obrigatória vazia:** preencha `DB_PASSWORD`, `DB_ROOT_PASSWORD` e `JWT_SECRET`. Use `openssl rand -base64 32` para gerar uma chave JWT.
- **Banco existente rejeita a senha:** o volume preserva as credenciais da primeira criação. Restaure as credenciais corretas no `.env`; não apague o volume para resolver isso.
- **Serviço não ficou pronto:** consulte `./etp status` e os logs do serviço. Depois de corrigir o problema, repita `./etp iniciar`. Serviços já iniciados ficam disponíveis para diagnóstico até executar `./etp parar`.
- **Sem permissão para executar o arquivo:** use `bash ./etp iniciar`.

Para preparar as credenciais antes de iniciar, execute `./etp configurar` e edite o arquivo gerado. Para um ambiente separado de testes, o comando aceita `ETP_ENV_FILE` e o `COMPOSE_PROJECT_NAME` do Docker Compose; use também portas diferentes.
