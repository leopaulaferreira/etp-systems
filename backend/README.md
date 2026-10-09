# Backend do ETP Systems

API Java 21 + Spring Boot 4.1.1, MySQL 8 e Maven. As Fases 1–8 entregam a base, catálogo, autenticação, inscrições, progresso e avaliações de cursos piloto.

## Estrutura

```text
src/main/java/br/com/etpsystems/
├── EtpSystemsApplication.java
├── auth/          # Login, usuário autenticado, DTOs e erros de autenticação
├── security/      # JWT, BCrypt, regras de acesso e CORS
├── company/       # Empresa e repositório
├── config/        # OpenAPI e contas locais opcionais
├── course/Categoria.java
├── course/Curso.java, CursoController.java, CursoService.java,
│   CursoRepository.java e CursoResponse.java
├── enrollment/    # Inscrições em cursos e consulta de Meus Cursos
├── progress/      # Atualização e persistência do progresso em cursos
├── assessment/    # Aulas, questões, alternativas, tentativas e notas
├── track/Trilha.java
└── user/          # Usuario, Perfil e repositório
```

Os módulos `certificate`, `report` e `ai` serão criados à medida que suas regras forem implementadas. Cada domínio agrupa controller, service, repository, entity e DTO quando necessários.

As migrações em `src/main/resources/db/migration/` criam o schema (V1), acrescentam o catálogo (V2–V3), normalizam os perfis (V4), permitem inscrições em cursos (V5), registram a conclusão do progresso (V6), criam aulas e avaliações piloto (V7–V8) e associam as duas primeiras videoaulas de LGPD (V9). Em bancos criados antes do Flyway, a V1 é registrada como baseline e as demais migrações são aplicadas. O arquivo [`../database/schema.sql`](../database/schema.sql) permanece como referência histórica. Com `spring.jpa.hibernate.ddl-auto=validate`, a aplicação verifica o mapeamento na inicialização e não altera as tabelas por conta própria.

## Modelo atual

- Um `Usuario` pertence a zero ou uma `Empresa`; uma empresa pode ter vários usuários.
- Um `Curso` pertence a zero ou uma `Categoria`; uma categoria pode classificar vários cursos.
- Uma `Trilha` pode pertencer a uma empresa e contém vários cursos; um curso pode participar de várias trilhas pela tabela `trilhas_cursos`.
- Uma `Inscricao` vincula um colaborador a um curso ou uma trilha. A V5 impede destinos vazios ou duplos e inscrições repetidas no mesmo curso.
- Um `ProgressoCurso` guarda percentual, atualização e conclusão por usuário e curso. O percentual só pode ser alterado pelo colaborador inscrito.
- Uma `Avaliacao` pertence a um curso e contém questões com alternativas. Cada `Tentativa` pertence ao colaborador e guarda suas respostas, nota e aprovação.
- As associações são navegáveis apenas pelo lado necessário nesta fase. Isso evita coleções grandes e carregamentos circulares em `Empresa`, `Categoria` e `Curso`.
- Os identificadores são UUIDs armazenados como `CHAR(36)`. As datas continuam preenchidas pelo MySQL.

Os perfis são `COLABORADOR` e `EMPRESA`. A V4 converte `aluno` e `aluno_1` para `COLABORADOR`, preservando os usuários. Senhas legadas não são convertidas automaticamente: valores que não são hashes BCrypt válidos não autenticam. Uma conta `EMPRESA` representa uma pessoa do RH e precisa estar vinculada a uma empresa para entrar.

O catálogo inicial preserva título, descrição, categoria, nível, duração, ícone e destaque do mock; a contagem fictícia de alunos não foi gravada.

## Configuração local

É necessário Java 21+, Maven 3.9+ e MySQL 8. Copie `backend/.env.example` para `backend/.env` e preencha `DB_PASSWORD`, `DB_ROOT_PASSWORD` e `JWT_SECRET`. Gere a chave JWT com `openssl rand -base64 32`. O arquivo `.env` é ignorado pelo Git. O banco usa `etp_db`, usuário `etp_user`, porta 3307 no host e 3306 no Docker.

`JWT_SECRET` é uma chave de assinatura aleatória, separada da senha dos usuários. `JWT_EXPIRATION_MINUTES` vale 60 por padrão (intervalo permitido: 1–1440). `CORS_ALLOWED_ORIGINS` aceita uma lista de origens separadas por vírgula; os padrões locais são `http://localhost:5173` e `http://127.0.0.1:5173`.

Para iniciar os serviços com Docker, na raiz do repositório:

```bash
docker compose --env-file backend/.env up --build -d database backend
```

O backend responde em `http://localhost:8080` por padrão. Se a porta 8080 estiver ocupada, altere `ETP_BACKEND_PORT` no `.env`, por exemplo para `18080`. A conexão interna do container aponta para `database:3306`; a aplicação local usa `localhost:3307`.

Em um volume já existente, mudar usuário ou senha no `.env` não altera automaticamente as credenciais armazenadas no banco. As novas alterações estruturais são aplicadas pelo Flyway na inicialização do backend.

Para executar a aplicação localmente com o MySQL do Compose:

```bash
set -a
. backend/.env
set +a
mvn -f backend/pom.xml spring-boot:run
```

O `.env` deve conter apenas variáveis no formato `CHAVE=valor`. Se a senha contiver caracteres interpretados pelo shell, coloque o valor entre aspas no arquivo.

## Contas do grupo no ambiente local

Para criar as contas automaticamente, configure `SPRING_PROFILES_ACTIVE=dev`, `ETP_DEMO_ENABLED=true` e `ETP_DEMO_PASSWORD` no `.env`. A senha é codificada com BCrypt antes de ser gravada; não inclua o valor real neste README, nas migrações ou em commits.

| E-mail padrão | Perfil | Vínculo |
| --- | --- | --- |
| `etp@gmail.com` | `COLABORADOR` | ETP Demonstração |
| `rhetp@gmail.com` | `EMPRESA` | ETP Demonstração |

Os e-mails podem ser configurados com `ETP_DEMO_COLABORADOR_EMAIL` e `ETP_DEMO_EMPRESA_EMAIL`. O inicializador é transacional e funciona apenas no perfil `dev` com a opção habilitada. Reiniciar não duplica usuários nem altera suas senhas. Alterar `ETP_DEMO_PASSWORD` depois da criação não redefine a senha existente. Conflitos com contas de outro perfil ou empresa interrompem a inicialização em vez de sobrescrever dados.

## Autenticação — Fase 4

`POST /api/auth/login` recebe:

```json
{
  "email": "etp@gmail.com",
  "senha": "<senha configurada no ambiente local>"
}
```

A resposta contém `accessToken`, `tokenType: "Bearer"`, `expiresIn` em segundos e `usuario` com `id`, `nome`, `email`, `perfil` e `empresaId`. O perfil vem do banco; campos extras enviados pelo cliente não concedem permissões. Nenhuma resposta de usuário expõe senha ou hash.

`GET /api/auth/me` exige `Authorization: Bearer <accessToken>` e consulta o usuário atual. No Swagger, faça login, copie `accessToken`, clique em **Authorize** e cole somente o token para testar `/api/auth/me`.

| Rotas | Regra |
| --- | --- |
| `POST /api/auth/login` | Pública |
| `GET /api/auth/me` | JWT válido de colaborador ou empresa |
| `GET /api/cursos` e `GET /api/cursos/{id}` | Públicas durante a integração gradual |
| Health check, Swagger e OpenAPI (`GET`) | Públicos |
| `/api/empresa/**` | Reservadas ao perfil `EMPRESA`; funcionalidades entram nas próximas fases |
| `/api/colaborador/**` | Reservadas ao perfil `COLABORADOR`; inscrições, progresso, aulas e avaliações estão disponíveis |
| Demais rotas | Bloqueadas por padrão |

Entradas inválidas retornam 400; credenciais ou tokens inválidos retornam 401; falta de permissão retorna 403. As falhas de credenciais usam a mesma mensagem para usuário inexistente e senha errada. A validação JWT verifica assinatura HS256, emissor, expiração, UUID do usuário e perfil.

A API usa Bearer sem cookies de sessão. O token expira após o prazo configurado; não há refresh token nem revogação individual nesta fase. Na futura integração, sair removerá o token do cliente, mas uma cópia continuará válida até expirar. `/api/auth/me` já rejeita usuário removido ou com perfil diferente do token.

A Fase 4 não inclui cadastro público, confirmação/recuperação por e-mail nem login Google/Microsoft. A Fase 5 conecta a tela de login à API: o React valida a sessão por `/api/auth/me` ao recarregar e trata expiração e falhas de conexão. Consulte o [guia do frontend](../frontend/README.md).

## Inscrições e Meus Cursos — Fase 6

- `POST /api/colaborador/inscricoes/cursos/{cursoId}` inscreve o colaborador identificado pelo JWT. Repetir a chamada retorna a inscrição existente sem duplicá-la; curso inexistente retorna 404.
- `GET /api/colaborador/meus-cursos` lista apenas os cursos inscritos pelo colaborador autenticado, em ordem da inscrição mais recente. A resposta contém dados básicos do curso e `enrolledAt`, sem entidades JPA ou informações de outros usuários.
- O banco conserva as inscrições antigas em trilhas. A API para iniciar novas inscrições em trilhas fica para a integração dessa tela.
- Progresso, aulas concluídas e certificados continuam nas fases seguintes; a Fase 6 não inventa percentuais.

## Progresso — Fase 7

`PUT /api/colaborador/meus-cursos/{cursoId}/progresso` recebe `{ "percentual": 45 }` e exige JWT de `COLABORADOR` inscrito no curso. Aceita valores entre 0 e 100, com até duas casas decimais; valor inválido retorna 400 e curso não inscrito retorna 404. A chamada grava o percentual na tabela `progresso_cursos`. Ao chegar a 100%, registra a data de conclusão; ao voltar para menos de 100%, remove essa data. Repetir 100% preserva a data original.

`GET /api/colaborador/meus-cursos` e a resposta do `PUT` incluem `progress`, `updatedAt` e `completedAt`. Cursos sem registro de progresso aparecem com 0% e datas nulas. O avanço é **informado manualmente pelo colaborador**, pois a leitura e os vídeos das aulas ainda não são rastreados. A conclusão nesta fase não emite certificado automaticamente.

## Aulas e avaliações — Fase 8

Três cursos já existentes receberam aulas e uma avaliação de cinco questões: **LGPD na Prática**, **Fundamentos de Segurança da Informação** e **Computação em Nuvem: Conceitos e Aplicações**. LGPD na Prática agora tem duas videoaulas, enquanto os outros dois cursos piloto continuam com aulas em texto. Os demais cursos seguem no catálogo, mas suas páginas de estudo indicam que o conteúdo está em preparação. As avaliações aparecem somente para quem se inscreveu no curso correspondente.

- `GET /api/colaborador/cursos/{cursoId}/aulas` lista as aulas de um curso inscrito. As duas primeiras aulas de LGPD na Prática têm `videoUrl`; os demais vídeos ainda não foram adicionados.
- `GET /api/colaborador/avaliacoes` lista questões, opções e histórico de tentativas dos cursos inscritos.
- `POST /api/colaborador/avaliacoes/{id}/tentativas` recebe `{"respostas":[{"questaoId":"<uuid>","alternativaId":"<uuid>"}]}` com uma resposta válida para cada questão. O servidor calcula e grava a nota; resposta incompleta ou opção de outra questão retorna 400. Curso não inscrito retorna 404. Avaliação aprovada ou duas tentativas usadas retornam 409.

A nota mínima é 80%. O gabarito e as explicações só são enviados após aprovação ou após esgotar as duas tentativas. Antes disso, o frontend recebe apenas perguntas e opções. As respostas em edição ainda ficam somente na página; a tentativa passa a existir no banco quando o colaborador envia todas as respostas. O progresso manual da Fase 7 e a aprovação na avaliação são dados independentes; esta fase não emite certificado.

Para adicionar outro vídeo, coloque um MP4 em `frontend/public/videos/` e crie uma **nova migração Flyway** que preencha `aulas.video_url` com `/videos/nome-do-video.mp4`. A página também aceita URLs de incorporação `https://www.youtube-nocookie.com/embed/ID`. Não edite migrações já aplicadas, pois o Flyway verifica o checksum. A aplicação não armazena arquivos de vídeo no MySQL. A terceira aula de LGPD e a revisão das questões ficam para quando o vídeo final estiver disponível.

## Verificação

- `GET /actuator/health` retorna `{"status":"UP"}` quando a aplicação e o banco estão saudáveis.
- `/swagger-ui/index.html` abre o Swagger UI.
- `GET /v3/api-docs` fornece o documento OpenAPI JSON.
- `GET /api/cursos` retorna o catálogo na ordem de exibição; `GET /api/cursos/{id}` retorna um curso pelo UUID, com 404 para curso ausente.
- `mvn -f backend/pom.xml verify` executa build e testes de saúde, documentação, login, tokens, permissões e CORS sem exigir MySQL. Os testes usam uma chave JWT própria, que não é empacotada na aplicação.
- Com MySQL ativo e as variáveis locais carregadas, `ETP_DB_TEST=true mvn -f backend/pom.xml verify` inclui os testes de entidades, catálogo, autenticação, inscrições, progresso e avaliações com banco real. Sem essa variável, os testes de banco são ignorados.
- `AuthDatabaseIntegrationTest` cria contas e empresa temporárias com identificadores únicos, valida BCrypt/login e inicialização repetida, e remove os registros ao terminar. `DomainMappingIntegrationTest` reverte suas inserções por transação. As migrações Flyway permanecem aplicadas.

O Actuator expõe somente o endpoint de health. Login, catálogo, Meus Cursos, aulas e avaliações estão integrados ao frontend. A página Cursos recorre ao mock local em falhas de disponibilidade, mas não oferece inscrição nesse modo; respostas 401 encerram a sessão. Os demais domínios serão integrados nas próximas fases.
