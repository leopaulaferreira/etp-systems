# Guia de execução local — ETP Systems

[← Voltar à apresentação do projeto](README.md)

Este guia reúne os procedimentos técnicos para executar, demonstrar e validar o sistema. O ambiente Docker descrito é de **desenvolvimento** e usa o servidor do Vite para o frontend.

[Pré-requisitos](#pré-requisitos) · [Iniciar](#iniciar) · [Contas de demonstração](#contas-de-demonstração) · [Validação](#validação) · [Problemas comuns](#problemas-comuns)

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

Com a configuração gerada, os endereços padrão são:

| Serviço | Endereço |
| --- | --- |
| Aplicação | http://127.0.0.1:5174 |
| API | http://127.0.0.1:18080 |
| Swagger | http://127.0.0.1:18080/swagger-ui/index.html |
| MySQL | `127.0.0.1:3307` |

Os endereços efetivos aparecem no terminal. As portas ficam acessíveis apenas neste computador.

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

## Roteiro de demonstração

1. Entre como **Colaborador**, explore o catálogo e escolha um curso com aulas disponíveis. A ordenação padrão prioriza esses cursos.
2. Faça a inscrição, acesse uma aula e marque sua conclusão. Consulte o avanço em **Meus Cursos** e no dashboard.
3. Realize uma avaliação. A aprovação em um curso com certificação habilitada emite o documento e conclui o progresso do curso.
4. Consulte o certificado e baixe o PDF. Em **Relatórios**, confira os indicadores e a exportação CSV.
5. Saia da conta e entre como **Empresa / RH** para consultar o colaborador, seus resultados e o mesmo certificado emitido.
6. Para demonstrar tentativas extras, use um colaborador com as tentativas esgotadas sem aprovação. Em **Avaliações**, abra o resultado, informe o motivo e autorize uma nova tentativa.

Essas ações usam a API e persistem registros no banco local. As contas ilustrativas adicionais servem para compor o painel do RH e não podem fazer login. Não é necessário consumir tentativas das contas de demonstração para executar os testes automatizados de interface.

### Regras para interpretar os resultados

- O progresso dos cursos com aulas é calculado pelas aulas marcadas como concluídas. A rota legada de progresso manual permanece apenas para cursos sem aulas.
- As avaliações publicadas exigem 80% para aprovação e oferecem duas tentativas iniciais. Autorizações do RH acrescentam oportunidades para um colaborador e curso específicos, com motivo e histórico.
- O gabarito e as explicações são enviados apenas após aprovação, inclusive quando as tentativas se esgotam. Notas e respostas enviadas permanecem no histórico; a tentativa extra usa as mesmas questões.
- Respostas ainda não enviadas ficam em memória na sessão. Os avisos de saída e recarga evitam perdas acidentais, mas não representam salvamento automático no servidor.
- Horas certificadas somam a carga horária dos cursos certificados. Concluir aulas, ser aprovado e receber um certificado são registros distintos.

## Desenvolvimento sem containers de aplicação

Para executar o frontend com Node ou a API com Java/Maven, consulte os guias de [frontend](frontend/README.md#como-rodar) e [backend](backend/README.md#configuração-local). Eles descrevem as dependências, o proxy da API e a conexão com o MySQL.

As migrações em `backend/src/main/resources/db/migration/` são a fonte de evolução do banco. O Hibernate valida o esquema na inicialização. O arquivo `database/schema.sql` é uma referência histórica; não deve ser aplicado sobre o banco gerenciado pelo Flyway.

## Validação

Os comandos desta seção usam ferramentas instaladas no computador. Para o frontend, utilize Node 22.18+; para o backend, Java 21+ e Maven 3.9+.

Na raiz do repositório:

```sh
npm --prefix frontend ci
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend test
mvn -f backend/pom.xml verify
bash tests/local-startup.sh
```

O Maven padrão executa os testes que não dependem de MySQL, incluindo autenticação, permissões e regras de exposição do gabarito. **Os testes de integração com banco são ignorados sem `ETP_DB_TEST=true`.** Para incluí-los, configure um banco dedicado e suas variáveis de conexão conforme o [guia do backend](backend/README.md#verificação). Essa suíte aplica migrações e cria dados de teste; não use o banco da demonstração.

Para os testes de navegador:

```sh
cd frontend
npx playwright install chromium
npm run test:mobile
```

A suíte inicia o Vite em `127.0.0.1:5178`, que deve estar livre, e simula a API em cinco tamanhos de tela. Não modifica o banco nem consome tentativas de contas reais. Consulte os [cenários e limites dos testes de interface](frontend/tests/browser/README.md).

## Autenticação e configuração

As configurações locais ficam em `backend/.env`, ignorado pelo Git. As opções disponíveis estão em [`backend/.env.example`](backend/.env.example); mantenha senhas e chaves fora dos arquivos versionados.

- **Chave JWT:** `JWT_SECRET` deve representar pelo menos 32 bytes em Base64. Para gerar uma chave, use `openssl rand -base64 32`.
- **Expiração:** `JWT_EXPIRATION_MINUTES` vale 60 por padrão e aceita valores de 1 a 1440. O backend verifica assinatura HS256, emissor, expiração, identificador, perfil e situação atual da conta.
- **Sessão no navegador:** o token fica em `sessionStorage`, por aba. O logout remove a sessão local; não há renovação automática nem revogação individual do token no servidor.
- **Limite de login:** por padrão, são permitidas 10 solicitações por IP em 60 segundos, incluindo logins válidos e corpos inválidos. O excesso retorna HTTP 429 com `Retry-After`. As propriedades da API são `LOGIN_MAX_REQUESTS` e `LOGIN_WINDOW_SECONDS`; para alterá-las com Docker, é necessário repassá-las ao serviço backend no Compose. O controle é em memória por instância; atrás de proxy, a identificação do IP precisa ser configurada ou o limite aplicado no próprio proxy.

A configuração gerada habilita dados de demonstração. A execução isolada do MySQL em uma VM está documentada em [`deploy/oracle/`](deploy/oracle/README.md); esse guia não implanta o frontend nem o backend.

## Problemas comuns

- **Porta ocupada:** ajuste `ETP_FRONTEND_PORT`, `ETP_BACKEND_PORT` ou `DB_PORT` em `backend/.env` e execute `./etp iniciar` novamente. O proxy entre frontend e API é configurado pelo Compose, independentemente das portas externas.
- **Docker indisponível:** abra o Docker Desktop ou inicie o serviço Docker e confira o acesso do seu usuário. No Windows, habilite a integração com sua distribuição WSL2.
- **Credencial obrigatória vazia:** preencha `DB_PASSWORD`, `DB_ROOT_PASSWORD` e `JWT_SECRET`. Use `openssl rand -base64 32` para gerar uma chave JWT.
- **Banco existente rejeita a senha:** o volume preserva as credenciais da primeira criação. Restaure as credenciais corretas no `.env`; não apague o volume para resolver isso.
- **Serviço não ficou pronto:** consulte `./etp status` e os logs do serviço. Depois de corrigir o problema, repita `./etp iniciar`. Serviços já iniciados ficam disponíveis para diagnóstico até executar `./etp parar`.
- **Sem permissão para executar o arquivo:** use `bash ./etp iniciar`.

Para preparar as credenciais antes de iniciar, execute `./etp configurar` e edite o arquivo gerado. Para um ambiente separado de testes, o comando aceita `ETP_ENV_FILE` e o `COMPOSE_PROJECT_NAME` do Docker Compose; use também portas diferentes.
