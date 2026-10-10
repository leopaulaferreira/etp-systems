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
- autenticação real por JWT;
- rotas públicas e protegidas;
- separação entre perfis de acesso;
- logout.

O login do frontend está integrado à API com BCrypt e JWT. A sessão é validada ao
recarregar, respeita os perfis Colaborador e Empresa e é encerrada no logout ou na expiração.

---

## 📊 Dashboard

- visão geral da aprendizagem;
- indicadores de progresso;
- acesso rápido às principais áreas;
- indicadores reais de cursos, avaliações, certificados e horas certificadas;
- sugestões do catálogo e acesso ao curso em andamento.

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

- avaliações de cursos em que o colaborador se inscreveu;
- questões de múltipla escolha;
- controle de tentativas;
- cálculo de notas;
- nota mínima para aprovação;
- apresentação de resultados;
- feedback das respostas;
- indicadores de desempenho.

As tentativas e notas são registradas no backend. Três cursos piloto já incluem
avaliações; LGPD na Prática tem duas videoaulas, enquanto os outros dois têm aula
em texto. Os demais cursos aguardam conteúdo. O progresso ainda é informado
manualmente pelo colaborador.

---

## 🏆 Certificados

Certificados são emitidos após aprovação em avaliações de cursos habilitados,
com código único e consulta na API. A página de Certificados mostra os documentos
emitidos e permite baixar PDF. LGPD na Prática aguarda a terceira videoaula e a
revisão das questões antes de habilitar a emissão.

O Perfil consulta cursos em andamento, avaliações e certificados da conta autenticada.
Dados pessoais adicionais ainda são preenchidos localmente pelo usuário; campos sem
informação não recebem valores fictícios.

---

## 📈 Gestão Empresarial

A interface de Empresa/RH já permite visualizar um painel e consultar:

- colaboradores;
- progresso individual;
- desempenho das equipes;
- avaliações;
- cursos concluídos;
- certificações;
- indicadores de aprendizagem.

Essas telas ainda usam dados ilustrativos. A próxima etapa ligará as consultas ao
vínculo real entre a conta RH, a empresa e seus colaboradores, com isolamento
entre organizações. A preparação está descrita no [guia do backend](backend/README.md#preparação-para-empresa--rh--fase-11).

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

As Fases 1–9 do backend estão disponíveis em [`backend/`](backend/README.md): Spring Boot, MySQL, Docker, migrações, catálogo, login com BCrypt/JWT, inscrições, progresso, avaliações e certificados. Consulte o guia para configurar as contas locais, usar o Swagger e executar os testes.
