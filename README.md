# ETP Systems

**Plataforma de aprendizagem e desenvolvimento corporativo**, desenvolvida como projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas da Universidade Municipal de São Caetano do Sul (USCS).

O ETP reúne cursos, trilhas, avaliações e certificados. Colaboradores acompanham seus estudos; profissionais de Empresa/RH consultam o progresso da organização e autorizam tentativas extras de avaliação.

**Status:** em desenvolvimento. Os principais fluxos usam a API e o banco reais; funcionalidades ainda planejadas estão descritas abaixo.

## Executar localmente

Pré-requisitos: Docker em execução com Compose v2.20+, Bash (Linux/macOS ou WSL2) e OpenSSL para gerar a configuração. A primeira execução precisa de internet. Java, Maven, Node e MySQL rodam nos containers.

Na raiz do repositório:

```sh
./etp iniciar
```

O comando cria `backend/.env` se necessário, gera credenciais locais, inicia os serviços e aguarda ficarem prontos. Arquivos de configuração existentes são preservados. As migrações são aplicadas automaticamente; não execute `database/schema.sql` manualmente.

| Serviço | Endereço padrão |
| --- | --- |
| Aplicação | http://127.0.0.1:5174 |
| API | http://127.0.0.1:18080 |
| Swagger | http://127.0.0.1:18080/swagger-ui/index.html |
| MySQL | `127.0.0.1:3307` |

Os endereços efetivos aparecem no terminal. As portas do Compose ficam acessíveis somente neste computador.

### Contas de demonstração

Na configuração gerada pelo comando:

| Perfil no login | E-mail padrão |
| --- | --- |
| Colaborador | `etp@gmail.com` |
| Empresa / RH | `rhetp@gmail.com` |

A senha inicial está em `ETP_DEMO_PASSWORD` no arquivo `backend/.env`. Alterar esse valor depois não redefine senhas de contas já criadas. Não versione o arquivo de credenciais.

```sh
./etp parar          # Para os serviços e preserva os dados
./etp status         # Consulta o estado dos containers
./etp logs backend   # Acompanha os logs da API
./etp configurar    # Prepara a configuração sem iniciar os serviços
```

Consulte o [guia de execução local](docs/EXECUCAO_LOCAL.md) para configurar portas, usar um `.env` existente e resolver problemas. Para desenvolver sem containers de aplicação, consulte os guias de [backend](backend/README.md) e [frontend](frontend/README.md).

## Funcionalidades disponíveis

| Área | Comportamento atual |
| --- | --- |
| Autenticação | Login com BCrypt e JWT, validação da conta no banco, permissões por perfil, expiração e logout local |
| Cursos | Catálogo com busca, filtros, detalhes, inscrição e prioridade para cursos com aulas disponíveis |
| Meus Cursos | Inscrições da conta, retomada da última aula e progresso por conclusão de aulas |
| Trilhas | Inscrição nos cursos da trilha e acompanhamento do progresso agregado |
| Avaliações | Correção no servidor, histórico de notas, limite de tentativas e proteção das respostas em edição |
| Certificados | Emissão após aprovação em cursos habilitados, consulta e download de PDF |
| Dashboard e relatórios | Indicadores reais, atividade de aprendizagem e exportação CSV |
| Perfil | Dados pessoais, objetivo de aprendizagem, nível e preferência de notificações persistidos na API |
| Empresa / RH | Colaboradores, progresso, notas e certificados da própria organização; liberação individual de tentativa extra com motivo e histórico |

### Regras de aprendizagem

- Cursos com aulas calculam o progresso pelas aulas marcadas como concluídas. Cursos sem aulas mantêm o endpoint de progresso manual.
- A aprovação na avaliação emite certificado quando o curso está habilitado para certificação e leva o progresso do curso a 100%.
- As avaliações publicadas usam nota mínima de 80% e duas tentativas iniciais. O RH pode liberar uma tentativa extra quando elas se esgotam, desde que não haja aprovação.
- **Gabarito e explicações são enviados somente após aprovação**, inclusive quando as tentativas se esgotam. Nota e respostas enviadas continuam disponíveis. A tentativa extra reutiliza as questões do curso.
- Respostas ainda não enviadas ficam em memória durante a sessão. Navegação, recarga e logout têm avisos para evitar perda acidental; isso não representa salvamento no servidor.
- Horas certificadas representam a carga horária dos cursos certificados, não tempo de estudo medido.

### Limites atuais e próximos passos

- Formatos de conteúdo, lembretes e acessibilidade são preferências do navegador. Os controles não enviam notificações por e-mail ou push.
- Configurações de contato da empresa também são locais. A solicitação de suporte é simulada.
- Cadastro, recuperação de senha por e-mail e login Google/Microsoft ainda não estão disponíveis.
- O tutor com inteligência artificial está planejado. A proposta é integrar um provedor pelo backend para explicar conteúdos, responder dúvidas e apoiar o estudo.
- O ambiente Docker documentado é de desenvolvimento: o frontend usa o servidor do Vite.

## Organização do projeto

| Diretório | Conteúdo |
| --- | --- |
| [`backend/`](backend/README.md) | API Java 21+, Spring Boot, Spring Security, JPA e migrações Flyway |
| [`frontend/`](frontend/README.md) | SPA React, TypeScript, Vite e Tailwind CSS |
| [`database/`](database/README.md) | Documentação do banco e esquema histórico de referência |
| [`docs/`](docs/README.md) | Guia local, materiais acadêmicos, apresentações e mockups |
| `tests/` | Verificação do script de inicialização local |

As migrações em `backend/src/main/resources/db/migration/` são a fonte de evolução do banco MySQL. O Hibernate valida o esquema na inicialização.

## Validação

Os comandos abaixo usam as ferramentas instaladas no computador. Execute-os na raiz do repositório; para o frontend, use Node 22.18+ e instale as dependências com `npm --prefix frontend ci`.

```sh
mvn -f backend/pom.xml verify
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend test
bash tests/local-startup.sh
```

O Maven padrão executa os testes que não dependem de MySQL, incluindo autenticação, permissões e regras de exposição do gabarito. **Os testes de integração com banco são ignorados sem `ETP_DB_TEST=true`.** Para executá-los, configure um banco dedicado e suas variáveis de conexão conforme o [guia do backend](backend/README.md#verificação); a suíte aplica migrações e cria dados de teste.

Testes de navegador, em cinco tamanhos de tela:

```sh
cd frontend
npx playwright install chromium
npm run test:mobile
```

Eles iniciam o Vite e simulam as respostas da API, sem consumir tentativas de contas reais. Consulte os [cenários e limites dos testes de interface](frontend/tests/browser/README.md).

## Autenticação e configuração

`JWT_SECRET` deve representar pelo menos 32 bytes em Base64; para gerar uma chave, use `openssl rand -base64 32`. A duração do token é configurada por `JWT_EXPIRATION_MINUTES` (padrão: 60; permitido: 1–1440). O backend valida assinatura HS256, emissor, expiração, identificador e perfil, além de conferir se a conta continua habilitada.

O token fica em `sessionStorage`, por aba. Logout remove a sessão local; não há renovação automática nem revogação individual do token no servidor.

O login permite, por padrão, 10 solicitações por IP em 60 segundos, incluindo logins válidos e corpos inválidos. O excesso retorna HTTP 429 com `Retry-After`. Configure `LOGIN_MAX_REQUESTS` e `LOGIN_WINDOW_SECONDS` para ajustar os limites. O controle é em memória por instância; atrás de proxy, configure a identificação confiável do IP ou aplique o limite no proxy.

## Prévia

![Dashboard do ETP Systems](https://github.com/user-attachments/assets/16faf94b-bc0e-4697-9576-d2d00463929a)

Mais telas e materiais estão em [`docs/mockup/`](docs/mockup/).

### Conteúdo de Gestão do Tempo

O curso **Fundamentos da Gestão do Tempo** (antes **Gestão do Tempo e Prioridades**) inclui três aulas: fundamentos, definição de prioridades e produtividade no dia a dia. A avaliação tem 18 questões, seis por aula, quatro alternativas por questão, duas tentativas iniciais e aprovação a partir de 80%, com emissão de certificado. O cadastro existente é preservado pelas migrações V35 e V36.
