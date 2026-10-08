# Backend do ETP Systems

API Java 21 + Spring Boot 4.1.1, MySQL 8 e Maven. Esta primeira fase prepara a aplicação, a conexão com o banco, o health check e a documentação OpenAPI. As rotas de negócio e a autenticação entram nas próximas fases.

## Estrutura

```text
src/main/java/br/com/etpsystems/
├── EtpSystemsApplication.java
└── config/
    └── OpenApiConfig.java
```

Os módulos `auth`, `user`, `company`, `course`, `track`, `enrollment`, `progress`, `assessment`, `certificate`, `report` e `ai` serão criados à medida que suas regras forem implementadas. Cada módulo agrupará controller, service, repository, entity e DTO quando necessários.

O schema inicial está em [`../database/schema.sql`](../database/schema.sql). Nesta fase, o MySQL executa o script somente na primeira criação do volume. `spring.jpa.hibernate.ddl-auto=none` impede que Hibernate altere as tabelas. A modelagem e a validação das entidades ficam para a Fase 2.

## Configuração local

É necessário Java 21+, Maven 3.9+ e MySQL 8. Copie `backend/.env.example` para `backend/.env` e preencha `DB_PASSWORD` e `DB_ROOT_PASSWORD` com valores locais. O arquivo `.env` é ignorado pelo Git. O banco usa `etp_db`, usuário `etp_user`, porta 3307 no host e 3306 no Docker.

Para iniciar os serviços com Docker, na raiz do repositório:

```bash
docker compose --env-file backend/.env up --build -d database backend
```

O backend responde em `http://localhost:8080` por padrão. Se a porta 8080 estiver ocupada, altere `ETP_BACKEND_PORT` no `.env`, por exemplo para `18080`. A conexão interna do container aponta para `database:3306`; a aplicação local usa `localhost:3307`.

O script `database/schema.sql` roda apenas quando o volume MySQL está vazio. Em um volume já existente, mudar usuário ou senha no `.env` não altera automaticamente as credenciais armazenadas no banco.

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
- `mvn -f backend/pom.xml test` verifica os três endpoints com servidor HTTP de teste. O teste desativa apenas a conexão externa; a integração real com MySQL deve ser conferida ao iniciar pelo Compose.

O Actuator expõe somente o endpoint de health. O frontend continua usando seus mocks até as APIs de domínio e autenticação estarem prontas.
