# Avaliações

A página `/avaliacoes` usa a API autenticada do colaborador. Exibe apenas avaliações dos cursos em que a conta se inscreveu. Os oito itens em `tests/fixtures/avaliacoes.fixture.ts` continuam como dados de referência para testes do protótipo e não alimentam a tela.

`assessmentApi.ts` valida as respostas de `GET /api/colaborador/avaliacoes` e envia tentativas completas por `POST /api/colaborador/avaliacoes/{id}/tentativas`. A API calcula e persiste nota, aprovação e respostas; o frontend apenas mostra o resultado. O gabarito não chega ao navegador antes da aprovação ou da última tentativa. Uma tentativa só é consumida no envio. As escolhas em edição ficam em memória e se perdem ao sair da página ou recarregar.

O diálogo, filtros, indicadores e gráfico foram reaproveitados. O gráfico utiliza as notas registradas pela API. A busca e os filtros continuam locais. Durante a avaliação, **Voltar às aulas** retorna à aula de origem quando a avaliação foi aberta pela página de estudo; o botão de avaliação permite retomar as respostas ainda em memória. Em caso de falha ao carregar, há uma ação para tentar novamente; em falha no envio, as escolhas atuais são preservadas para nova tentativa de envio.

LGPD na Prática e Introdução à Inteligência Artificial têm seis questões, padrão para os próximos cursos; Segurança da Informação e Computação em Nuvem têm cinco. Cada questão tem quatro alternativas, nota mínima de 80% e duas tentativas. Aprovação e conclusão manual do curso são informações separadas. A avaliação de IA ainda não habilita certificado.

Verificação: `npm run test:avaliacoes`, `npm run build` e `npm run lint` em `frontend/`.
