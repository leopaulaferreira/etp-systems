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

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # BrowserRouter + AuthProvider + AppRoutes
│   │   └── routes/
│   │       └── AppRoutes.tsx       # tabela de rotas (pública + protegidas)
│   ├── api/client.ts               # JSON, timeout e erros HTTP
│   ├── auth/                       # autenticação pela API
│   │   ├── AuthContext.tsx
│   │   ├── RequireAuth.tsx
│   │   ├── SessionGate.tsx
│   │   ├── auth.ts
│   │   └── session.ts
│   ├── layouts/
│   │   ├── AppLayout.tsx           # Sidebar + Topbar + <Outlet/>
│   │   └── AppLayout.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── navItems.ts
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Checkbox.tsx
│   │       └── Avatar.tsx
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── login.css
│   │   │   ├── loginTranslations.ts
│   │   │   └── components/
│   │   │       ├── BrandIcons.tsx
│   │   │       └── LoginBackdrop.tsx
│   │   ├── Dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── components/
│   │   │       ├── WelcomeSection.tsx
│   │   │       ├── WelcomeIllustration.tsx   # placeholder decorativo, ver comentário no arquivo
│   │   │       ├── StatsGrid.tsx
│   │   │       └── MetricCard.tsx
│   │   └── ComingSoonPage.tsx      # placeholder para Trilhas/Cursos/Meus Cursos/Avaliações/
│   │                               # Certificados/Relatórios/Perfil/Configurações
│   ├── mocks/                      # dados fictícios, separados por domínio
│   │   ├── user.mock.ts
│   │   └── dashboard.mock.ts
│   ├── styles/
│   │   ├── theme.css                # fonte única dos tokens visuais (cores, sombra, fonte)
│   │   └── global.css               # import do Tailwind + theme + reset/body
│   ├── assets/
│   │   └── etp-symbol.svg
│   └── main.tsx
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

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
| `/cursos` | autenticada | `CursosPage` — catálogo com busca, filtros, ordenação e detalhes |
| `/avaliacoes` | autenticada | `AvaliacoesPage` — filtros, atividades, notas, resultados e gráficos |
| `/configuracoes` | autenticada | `ConfiguracoesPage` — dados pessoais, preferências de estudo e notificações |
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

O catálogo envia Bearer nas consultas e conserva a alternativa local para falhas
de disponibilidade. Um 401 encaminha para autenticação, sem ativar esse fallback.
Quando a API está disponível, o catálogo permite a inscrição real em cursos.
`/meus-cursos` consulta os cursos da conta pelo JWT e permite atualizar manualmente o percentual de progresso. Cursos em 100% aparecem na aba Concluídos.
Cadastro, recuperação por e-mail e login Google/Microsoft continuam indisponíveis;
os textos da tela explicam isso sem aceitar credenciais fictícias.

Nome e e-mail iniciais vêm da conta real. Personalizações de perfil, preferências
de estudo e configurações locais da empresa usam chaves por usuário. Avaliações
em memória são reiniciadas quando a conta muda. O e-mail de acesso é somente
leitura até existir uma API para alterá-lo.

O [Painel da empresa](src/pages/Empresa/README.md) ainda usa dados sintéticos para
indicadores e colaboradores. O UUID real da empresa permanece na sessão; os dados
ilustrativos não são tratados como registros reais dessa organização.

Validação: `npm run build`, `npm run lint`, `npm run test:auth` e
`node --experimental-strip-types --test tests/*.test.mjs`. No navegador, verificar
ambos os perfis, senha incorreta, recarga, logout, expiração, falha de rede e retry.

## Status atual

- [x] **Login** (`/login`) — autenticação com validação, mostrar/ocultar senha, loading, login social (visual)
- [x] **Dashboard** (`/dashboard`) — indicadores reais, curso em andamento, sugestões do catálogo, avaliações e certificados recentes
- [x] **Cursos** (`/cursos`) — catálogo de 24 cursos, busca, filtros, ordenação, carregamento progressivo e detalhes ([documentação](src/pages/Cursos/README.md))
- [x] **Avaliações** (`/avaliacoes`) — resumo, filtros, questões interativas, resultados e gráficos ([documentação](src/pages/Avaliacoes/README.md))
- [x] **Meus Cursos, Avaliações e Certificados** — integrados à API do colaborador
- [ ] **Empresa, Perfil, Relatórios e partes de Trilhas** — ainda possuem dados ilustrativos

Login, catálogo, inscrições, progresso, avaliações, certificados e Dashboard usam a API real.
Algumas telas fora desses fluxos ainda utilizam dados de `src/mocks/`.
