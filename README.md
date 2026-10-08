# ETP Systems
### Plataforma de Gestão de Aprendizagem e Desenvolvimento Corporativo

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Projeto Acadêmico](https://img.shields.io/badge/projeto-acadêmico-blue)
![Backend](https://img.shields.io/badge/backend-Spring%20Boot-green)
![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20TypeScript-blue)
![Database](https://img.shields.io/badge/database-MySQL-orange)

Projeto acadêmico desenvolvido no curso de **Análise e Desenvolvimento de Sistemas
da Universidade Municipal de São Caetano do Sul (USCS)**.

---

# 📚 Sobre o Projeto

O **ETP Systems** é uma plataforma de aprendizagem corporativa criada para apoiar
organizações na gestão da capacitação e do desenvolvimento profissional de seus
colaboradores.

A solução centraliza **cursos, trilhas de aprendizagem, avaliações, acompanhamento
de progresso e certificações** em um único ambiente, permitindo que colaboradores
acompanhem sua própria evolução enquanto empresas, gestores e setores de Recursos
Humanos obtêm maior visibilidade sobre o desenvolvimento de suas equipes.

O projeto busca responder a um problema recorrente em ambientes corporativos:
a dificuldade de **organizar treinamentos, acompanhar a evolução dos participantes
e transformar dados de aprendizagem em informações úteis para colaboradores e
gestores**.

---

# 🎯 Problema que o ETP busca resolver

Processos de capacitação corporativa podem envolver diferentes cursos, plataformas,
avaliações e registros, tornando difícil acompanhar de forma centralizada:

- quais treinamentos cada colaborador está realizando;
- quais competências estão sendo desenvolvidas;
- o progresso individual e coletivo;
- resultados de avaliações;
- trilhas de aprendizagem;
- cursos concluídos e certificados obtidos;
- necessidades de desenvolvimento das equipes.

O **ETP Systems** propõe reunir essas informações em uma única plataforma,
facilitando tanto a experiência de aprendizagem do colaborador quanto a gestão
do desenvolvimento profissional pela organização.

---

# 💡 Proposta da Solução

O ETP Systems funciona a partir de dois perfis principais.

## 👤 Colaborador

O colaborador pode:

- acessar cursos e treinamentos;
- seguir trilhas de aprendizagem;
- acompanhar cursos em andamento;
- visualizar seu progresso;
- realizar avaliações;
- acompanhar notas e resultados;
- consultar certificados;
- visualizar seu histórico de aprendizagem;
- receber recomendações de conteúdo.

## 🏢 Empresa / RH

O perfil organizacional será responsável por funcionalidades de gestão, como:

- acompanhar colaboradores;
- visualizar progresso das equipes;
- consultar resultados de avaliações;
- acompanhar cursos e trilhas concluídas;
- visualizar indicadores de aprendizagem;
- organizar conteúdos e programas de capacitação;
- identificar necessidades de desenvolvimento.

A separação entre os dois perfis permite que o sistema atenda tanto quem aprende
quanto quem organiza e acompanha o processo de capacitação.

---

# 🎯 Objetivos do Projeto

O ETP Systems tem como objetivos:

- centralizar processos de **aprendizagem corporativa**;
- estruturar **trilhas de desenvolvimento profissional**;
- facilitar o acompanhamento do **progresso dos colaboradores**;
- disponibilizar mecanismos de **avaliação da aprendizagem**;
- registrar cursos concluídos e **certificações**;
- fornecer informações para apoiar gestores e setores de **Recursos Humanos**;
- tornar processos de capacitação mais **organizados, acessíveis e mensuráveis**;
- contribuir para iniciativas de **desenvolvimento e valorização de talentos**.

Resultados organizacionais mais amplos, como retenção de talentos, mobilidade
interna ou redução da dependência de recrutamento externo, são tratados como
impactos potenciais e dependerão de validação futura.

---

# 🖼️ Prévia da Interface

## Dashboard

O dashboard apresenta uma visão geral da experiência de aprendizagem do colaborador,
reunindo indicadores, atalhos para cursos e informações sobre o progresso dentro da
plataforma.

Ele funciona como o ponto central de navegação do ETP Systems após a autenticação,
conectando o usuário às principais áreas da aplicação.

<img width="1920" height="1080" alt="Captura de tela de 2026-09-30 12-32-13" src="https://github.com/user-attachments/assets/16faf94b-bc0e-4697-9576-d2d00463929a" />


---

# 🖥️ Funcionalidades

## 🔐 Autenticação

- login de usuário;
- estrutura preparada para autenticação real;
- rotas públicas e protegidas;
- separação entre perfis de acesso;
- logout.

Atualmente a autenticação do frontend utiliza dados fictícios enquanto o backend
está em desenvolvimento.

---

## 📊 Dashboard

- visão geral da aprendizagem;
- indicadores de progresso;
- acesso rápido às principais áreas;
- estrutura preparada para indicadores provenientes da API.

---

## 🎓 Cursos

- catálogo de cursos;
- busca por conteúdo;
- filtros por categoria;
- filtros por nível;
- ordenação;
- detalhes dos cursos;
- carregamento progressivo dos resultados.

---

## 🛤️ Trilhas de Aprendizagem

As trilhas permitem organizar cursos relacionados em sequências de desenvolvimento,
facilitando a criação de jornadas de aprendizagem estruturadas.

---

## 📚 Meus Cursos

Área destinada ao acompanhamento dos cursos do colaborador, incluindo:

- cursos em andamento;
- progresso;
- cursos concluídos;
- continuidade da aprendizagem.

---

## 📝 Avaliações

O módulo de avaliações permite:

- avaliações pendentes, em andamento, concluídas ou agendadas;
- questões de múltipla escolha e verdadeiro/falso;
- controle de tentativas;
- cálculo de notas;
- nota mínima para aprovação;
- apresentação de resultados;
- feedback das respostas;
- indicadores de desempenho.

Atualmente essa lógica funciona no frontend com dados fictícios e será integrada
ao backend.

---

## 🏆 Certificados

Planejado para registrar e disponibilizar certificados associados aos cursos
concluídos.

---

## 📈 Gestão Empresarial

Planejado para permitir que empresas, gestores ou setores de RH acompanhem:

- colaboradores;
- progresso individual;
- desempenho das equipes;
- avaliações;
- cursos concluídos;
- certificações;
- indicadores de aprendizagem.

---

# 🤖 Tutor Inteligente

O projeto prevê a implementação de um **assistente de aprendizagem baseado em
Inteligência Artificial**.

O tutor poderá utilizar o contexto do curso e do módulo estudado para auxiliar
o colaborador com funções como:

- explicar conteúdos de maneiras diferentes;
- esclarecer dúvidas;
- gerar exemplos;
- resumir conteúdos;
- criar exercícios de apoio;
- fornecer explicações adicionais durante o processo de aprendizagem.

A integração está planejada para utilizar uma API de IA através do backend,
mantendo o frontend desacoplado do provedor utilizado.

Arquitetura prevista:

```text
TutorService
     │
     ▼
 AiProvider
     │
     ├── GeminiProvider
     │
     └── outros provedores futuramente

```

## Backend

A Fase 1 do backend está disponível em [`backend/`](backend/README.md): Spring Boot, MySQL, Docker, health check e Swagger/OpenAPI. Consulte o guia para configurar o ambiente e executar os testes.
