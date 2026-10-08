# Banco de Dados - ETP Systems

Esta pasta contém os **arquivos de referência do banco de dados do ETP Systems**.

O [`schema.sql`](schema.sql) registra o schema original. O backend aplica a estrutura atual e suas mudanças pelas migrações Flyway em [`backend/src/main/resources/db/migration`](../backend/src/main/resources/db/migration). O Docker Compose não executa mais este script diretamente.

Aqui serão armazenados os **scripts SQL e materiais de modelagem** utilizados para criar e estruturar o banco de dados da aplicação.

---

## 📦 Banco de dados utilizado

O projeto utiliza o **MySQL** como sistema de gerenciamento de banco de dados.

---

## 📂 Conteúdo da pasta

Nesta pasta podem ser adicionados:

- Scripts de criação do banco de dados
- Scripts de criação das tabelas
- Modelos de banco de dados
- Diagramas de entidade-relacionamento (DER)
- Alterações e atualizações do banco

Exemplo de arquivos:
schema.sql
tabelas.sql
diagramas


---

## ⚙️ Estrutura básica do banco

O banco de dados armazenará informações como:

- Usuários
- Cursos
- Progresso dos usuários
- Certificações

---

## 🎯 Objetivo

Centralizar os **scripts e a estrutura do banco de dados**, garantindo que todos os integrantes do projeto possam **criar e utilizar o mesmo banco de dados durante o desenvolvimento**.
