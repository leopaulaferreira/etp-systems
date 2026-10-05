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

## Estrutura

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # BrowserRouter + AuthProvider + AppRoutes
│   │   └── routes/
│   │       └── AppRoutes.tsx       # tabela de rotas (pública + protegidas)
│   ├── auth/                       # autenticação MOCK (ver nota abaixo)
│   │   ├── AuthContext.tsx
│   │   ├── RequireAuth.tsx
│   │   └── auth.mock.ts
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

## Autenticação (MOCK)

`src/auth/` contém uma sessão **mock** com perfil Colaborador ou Empresa. O login direciona ao painel correspondente, mantém o perfil ao recarregar e limpa a sessão no logout. A persistência passa por `useAuth()`. A separação de rotas organiza a interface, mas a autenticação e a autorização por empresa deverão ser implementadas na API (Spring Security/JWT). A integração também atualizará o envio de credenciais no login e os estados de erro/expiração.

O [Painel da empresa](src/pages/Empresa/README.md) usa um conjunto único de dados para indicadores, lista e resumos individuais.

## Status atual

- [x] **Login** (`/login`) — autenticação com validação, mostrar/ocultar senha, loading, login social (visual)
- [x] **Dashboard — Etapa 1** (`/dashboard`) — layout, hero e cards de métricas
- [ ] **Dashboard — Etapa 2** (Continuar aprendendo, Recomendações, Conquistas, Certificados, Meu progresso)
- [x] **Cursos** (`/cursos`) — catálogo de 24 cursos, busca, filtros, ordenação, carregamento progressivo e detalhes ([documentação](src/pages/Cursos/README.md))
- [x] **Avaliações** (`/avaliacoes`) — resumo, filtros, questões interativas, resultados e gráficos ([documentação](src/pages/Avaliacoes/README.md))
- [ ] Demais páginas (Trilhas, Meus Cursos, Certificados, Relatórios, Perfil, Configurações) — hoje são placeholders (`ComingSoonPage`)

O front-end ainda não está integrado a uma API real — os dados são fictícios/estáticos (`src/mocks/`) por enquanto.
