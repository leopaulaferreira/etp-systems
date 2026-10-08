# Backend do ETP Systems

API Java 21 + Spring Boot 4.1.1, MySQL 8 e Maven. As primeiras fases preparam a aplicação, o mapeamento das entidades centrais e a API pública de consulta de cursos. A autenticação entra em uma próxima fase.

## Estrutura

```text
src/main/java/br/com/etpsystems/
├── EtpSystemsApplication.java
├── company/Empresa.java
├── config/OpenApiConfig.java
├── course/Categoria.java
├── course/Curso.java, CursoController.java, CursoService.java,
│   CursoRepository.java e CursoResponse.java
├── track/Trilha.java
└── user/Usuario.java
```

Os módulos `auth`, `enrollment`, `progress`, `assessment`, `certificate`, `report` e `ai` serão criados à medida que suas regras forem implementadas. Cada domínio agrupará controller, service, repository, entity e DTO quando necessários.

As migrações em `src/main/resources/db/migration/` criam o schema (V1), acrescentam os campos do catálogo (V2) e incluem 24 cursos e 5 categorias iniciais (V3). Em bancos criados antes do Flyway, a V1 é registrada como baseline e as demais migrações são aplicadas. O arquivo [`../database/schema.sql`](../database/schema.sql) permanece como referência histórica. Com `spring.jpa.hibernate.ddl-auto=validate`, a aplicação verifica o mapeamento na inicialização e não altera as tabelas por conta própria.

## Modelo atual

- Um `Usuario` pertence a zero ou uma `Empresa`; uma empresa pode ter vários usuários.
- Um `Curso` pertence a zero ou uma `Categoria`; uma categoria pode classificar vários cursos.
- Uma `Trilha` pode pertencer a uma empresa e contém vários cursos; um curso pode participar de várias trilhas pela tabela `trilhas_cursos`.
- As associações são navegáveis apenas pelo lado necessário nesta fase. Isso evita coleções grandes e carregamentos circulares em `Empresa`, `Categoria` e `Curso`.
- Os identificadores são UUIDs armazenados como `CHAR(36)`. As datas continuam preenchidas pelo MySQL.

O campo `usuarios.perfil` permanece textual porque o banco existente contém valores legados (`aluno` e `aluno_1`). A migração para os perfis definitivos será definida junto da autenticação. O catálogo inicial preserva título, descrição, categoria, nível, duração, ícone e destaque do mock; a contagem fictícia de alunos não foi gravada.

## Configuração local

É necessário Java 21+, Maven 3.9+ e MySQL 8. Copie `backend/.env.example` para `backend/.env` e preencha `DB_PASSWORD` e `DB_ROOT_PASSWORD` com valores locais. O arquivo `.env` é ignorado pelo Git. O banco usa `etp_db`, usuário `etp_user`, porta 3307 no host e 3306 no Docker.

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

## Verificação

- `GET /actuator/health` retorna `{"status":"UP"}` quando a aplicação e o banco estão saudáveis.
- `/swagger-ui/index.html` abre o Swagger UI.
- `GET /v3/api-docs` fornece o documento OpenAPI JSON.
- `GET /api/cursos` retorna o catálogo na ordem de exibição; `GET /api/cursos/{id}` retorna um curso pelo UUID, com 404 para curso ausente.
- `mvn -f backend/pom.xml test` verifica os três endpoints com servidor HTTP de teste. Esse teste desativa apenas a conexão externa.
- Com o MySQL local ativo e as variáveis de `backend/.env` carregadas, `ETP_DB_TEST=true mvn -f backend/pom.xml -Dtest=DomainMappingIntegrationTest test` valida o schema e as cinco entidades com inserções revertidas ao final da transação. Sem `ETP_DB_TEST=true`, esse teste é ignorado para permitir execução sem banco.
- No mesmo ambiente, `ETP_DB_TEST=true mvn -f backend/pom.xml -Dtest=CursoApiIntegrationTest test` valida lista, detalhes, 404 e ID inválido usando MySQL real.

O Actuator expõe somente o endpoint de health. A página Cursos usa esta API e recorre ao mock local se a consulta falhar; as demais integrações e a autenticação permanecem para fases futuras.
