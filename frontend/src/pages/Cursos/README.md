# Cursos

Catálogo em `/cursos`, dentro do layout autenticado existente. A página consulta
`GET /api/cursos` e busca detalhes por `GET /api/cursos/{id}`. O mock
O catálogo é carregado pela API de cursos; falhas exibem um estado de erro com opção de tentar novamente
quando a API está indisponível. O destaque pertence ao catálogo.

## Funcionalidades

- Cabeçalho ilustrado, destaque de Cibersegurança e grade responsiva de cards.
- Busca por título, descrição e categoria, ignorando acentos e diferenças de caixa.
- Filtros combinados de categoria e nível, acessíveis pelo botão Filtrar.
- Ordenação por relevância, menor duração ou nome. Popularidade aparece apenas com o mock local, que contém números demonstrativos de alunos.
- Oito itens inicialmente; “Ver mais cursos” acrescenta oito por vez até o total.
- Alterar busca, filtros ou ordenação reinicia a quantidade exibida em oito.
- O destaque fica oculto durante uma busca ou filtro para não exibir conteúdo fora dos resultados.
- Estado vazio com ação para limpar a seleção e voltar ao catálogo completo.
- “Ver curso” abre os dados do item em um diálogo com foco controlado e fechamento por Escape.
- Com a API ativa, “Inscrever-se no curso” registra a inscrição da conta atual. Cursos já inscritos mostram “Acessar Meus Cursos”.

Busca, filtros e ordenação são locais e reiniciam ao sair da página ou recarregar.
O diálogo permite inscrição em cursos reais. Após a inscrição, a página `/cursos/:id/estudar` é acessível por Meus Cursos e mostra **uma aula por vez**, seja vídeo ou texto. A navegação usa **Aula anterior**, **Próxima aula** e a lista lateral; `?aula=N` identifica a aula aberta, permite voltar a ela pela avaliação e funciona também após recarregar a página. LGPD na Prática tem duas videoaulas sem o antigo resumo em texto; os outros dois cursos piloto continuam com resumo. Os demais cursos exibem um estado de conteúdo em preparação. No modo de
catálogo local, a inscrição fica indisponível para não criar uma confirmação fictícia.
Com a API ativa, a página omite contagens de alunos porque esse dado ainda não existe no banco.
Se a consulta falhar, aparece um aviso com ação para tentar novamente.

Em desenvolvimento, o Vite encaminha `/api` para `http://localhost:8080`. Para outra
porta, use `API_PROXY_TARGET=http://localhost:18080 npm run dev`. No Compose, o proxy
usa automaticamente o serviço `backend`.

## Validação

Execute em `frontend/`:

```bash
npm run build
npm run lint
npm run test:cursos
```

Os testes verificam dados da API, busca, filtros combinados, ordenação sem alterar o mock
e duração fracionada. No navegador, confira também o carregamento de 8/16/24 cards,
o estado vazio, a navegação por teclado nos detalhes e as larguras de celular a desktop.

Para outro vídeo, use um MP4 em `frontend/public/videos/` e associe sua URL à aula por uma nova migração do backend. Enquanto `videoUrl` for nulo, a página mantém um espaço visual com orientação para ler o resumo. Também são aceitos embeds de `www.youtube-nocookie.com` no formato `/embed/ID`.
