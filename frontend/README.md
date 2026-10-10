# Frontend - ETP Systems

Interface web do ETP Systems, construída em **React + TypeScript + Vite + Tailwind CSS**.

Aplicação única (SPA), com Login como rota pública e as demais telas como rotas autenticadas compartilhando o mesmo layout (sidebar + topbar).

## Stack

- **React 19** + **TypeScript**
- **React Router** — roteamento (público vs. autenticado)
- **Vite** — build e dev server
- **Tailwind CSS v4** — tokens visuais únicos em `src/styles/theme.css`
- **lucide-react** — ícones

## Como rodar

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

O login precisa do backend ativo. Configure e inicie os serviços conforme o
[guia do backend](../backend/README.md). O Vite encaminha `/api` para a porta 8080
por padrão. Para outra porta, copie `.env.example` para `.env.local` e ajuste
`API_PROXY_TARGET` (por exemplo, `http://localhost:18080`). Nenhum segredo do backend
deve ser copiado para o frontend. No Compose, o destino é `http://backend:8080`.

## Estrutura

- `src/app/routes/AppRoutes.tsx`: rotas públicas e protegidas por perfil.
- `src/auth/` e `src/api/client.ts`: sessão JWT e requisições à API.
- `src/layouts/` e `src/components/`: layout compartilhado e controles reutilizáveis.
- `src/pages/`: telas de colaborador, empresa, login e ajuda, organizadas por domínio.
- `tests/fixtures/`: dados de referência usados apenas nos testes de componentes e filtros.
- `src/styles/theme.css`: tokens de cores, tipografia e sombras.
- `public/videos/`: videoaulas servidas pelo Vite.

## Rotas

| Rota | Acesso | Página |
|---|---|---|
| `/login` | pública | `LoginPage` |
| `/dashboard` | colaborador | `DashboardPage` |
| `/empresa/dashboard` | empresa | `EmpresaPage` — visão geral, progresso e indicadores |
| `/empresa/colaboradores` | empresa | `ColaboradoresPage` — busca, filtros e resumo individual |
| `/empresa/avaliacoes` | empresa | `CompanyRecordsPage` — consulta das notas |
| `/empresa/certificados` | empresa | `CompanyRecordsPage` — consulta dos certificados |
| `/empresa/configuracoes/:section` | empresa | `CompanySettingsPage` — dados, conta e segurança |
| `/cursos` | colaborador | `CursosPage` — catálogo com busca, filtros, ordenação e detalhes |
| `/trilhas` | colaborador | `TrilhasPage` — trilhas, inscrição e progresso |
| `/relatorios` | colaborador | `RelatoriosPage` — indicadores e exportação CSV da conta |
| `/meus-cursos` | colaborador | `MeusCursosPage` — inscrições e progresso |
| `/avaliacoes` | colaborador | `AvaliacoesPage` — filtros, atividades, notas, resultados e gráficos |
| `/certificados` | colaborador | `CertificadosPage` — certificados emitidos e pendentes |
| `/perfil` | colaborador | `PerfilPage` — perfil persistido e resumo real de estudos |
| `/configuracoes` | colaborador | `ConfiguracoesPage` — dados pessoais, preferências de estudo e notificações |
| `/ajuda` | autenticada | `AjudaPage` — busca e categorias de FAQ, solicitação simulada de suporte |

## Autenticação — Fase 5

O formulário envia `{ email, senha }` a `POST /api/auth/login`. O perfil e a empresa
vêm da API. Se a opção Colaborador/Empresa não corresponder à conta, o formulário
orienta a trocar a seleção e não mantém o token retornado.

Somente token e validade ficam em `sessionStorage`, por aba. A senha nunca é
persistida. Ao recarregar, `GET /api/auth/me` valida a sessão antes de liberar as
rotas. As flags antigas do login mock são descartadas e não concedem acesso.
Se o armazenamento estiver bloqueado, o acesso funciona apenas em memória.

Expiração e respostas 401 encerram a sessão e pedem novo login. Respostas 403
preservam a sessão e são repassadas à tela para tratamento. Falhas de rede na restauração
oferecem retry ou retorno ao login; elas não liberam acesso nem simulam sucesso.
O cliente usa timeout de 12 segundos e cancela requisições ao sair da tela.

O logout limpa o token local. Não há renovação automática nem revogação individual
no servidor: uma cópia do JWT permanece válida até expirar. O token em
`sessionStorage` é acessível ao JavaScript desta origem; uma futura adoção de
cookies HttpOnly exigirá adaptar o backend e a proteção CSRF.

O catálogo envia Bearer nas consultas. Falhas de disponibilidade mostram erro e opção de tentar novamente. Um 401 encaminha para autenticação. O catálogo permite a inscrição real em cursos.
`/meus-cursos` consulta os cursos da conta pelo JWT e permite atualizar manualmente o percentual de progresso. Cursos em 100% aparecem na aba Concluídos.
Cadastro, recuperação por e-mail e login Google/Microsoft continuam indisponíveis;
os textos da tela explicam isso sem aceitar credenciais fictícias.

O perfil do colaborador é carregado e salvo pela API. E-mail e empresa são somente leitura na tela de Configurações. As preferências de formato, lembretes e acessibilidade continuam locais ao navegador. As configurações de contato da empresa também continuam locais. Respostas de avaliações ainda não enviadas ficam em memória e reiniciam quando a conta muda.

O [Painel da empresa](src/pages/Empresa/README.md) consulta os colaboradores da organização e seu progresso no banco. Ele atualiza os dados ao voltar para a aba.

Validação: `npm run build`, `npm run lint`, `npm run test:auth` e
`node --experimental-strip-types --test tests/*.test.mjs`. No navegador, verificar
ambos os perfis, senha incorreta, recarga, logout, expiração, falha de rede e retry.

## Status atual

- [x] **Login** (`/login`) — autenticação com validação, mostrar/ocultar senha, loading, login social (visual)
- [x] **Dashboard** (`/dashboard`) — indicadores reais, curso em andamento, sugestões do catálogo, avaliações e certificados recentes
- [x] **Cursos** (`/cursos`) — catálogo de 24 cursos, busca, filtros, ordenação, carregamento progressivo e detalhes ([documentação](src/pages/Cursos/README.md))
- [x] **Avaliações** (`/avaliacoes`) — resumo, filtros, questões interativas, resultados e gráficos ([documentação](src/pages/Avaliacoes/README.md))
- [x] **Meus Cursos e Certificados** — integrados à API do colaborador
- [x] **Perfil** — dados pessoais persistidos e resumo de cursos, avaliações e certificados
- [x] **Empresa** — colaboradores, progresso, notas e certificados reais
- [x] **Trilhas** — catálogo, inscrições e progresso reais
- [x] **Relatórios** — indicadores individuais calculados dos registros reais

Login, catálogo, inscrições, progresso, avaliações, certificados, Dashboard, Empresa, Trilhas, Relatórios e Perfil usam a API real. Os arquivos de exemplo usados por testes ficam em `tests/fixtures/`.
