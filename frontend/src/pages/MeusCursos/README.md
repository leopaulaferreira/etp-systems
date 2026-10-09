# Meus Cursos

A página `/meus-cursos` usa `GET /api/colaborador/meus-cursos` com o token da conta atual. O catálogo permite iniciar uma inscrição por `POST /api/colaborador/inscricoes/cursos/{cursoId}` e, após a confirmação, oferece o link para Meus Cursos.

- A aba **Inscritos** mostra cursos vinculados ao colaborador autenticado. Novas inscrições aparecem depois de abrir a página ou recarregá-la.
- **Concluídos** permanece vazia até a integração de progresso; nenhum percentual, última aula ou data de conclusão é inventado.
- **Salvos** é um estado local temporário da interface e recomeça vazio ao recarregar. Salvar um curso não cria uma inscrição.
- As sugestões vêm do catálogo real e não incluem cursos já inscritos.
- Falhas ao carregar inscrições mostram uma opção de tentar novamente. Dados de outro usuário ou do mock não substituem a lista real.

Os dados de `../../mocks/meus-cursos.mock.ts` permanecem no repositório como referência do protótipo, mas não alimentam a página autenticada. A reprodução de aulas e o progresso real pertencem às próximas fases.

Validação: `npm run build`, `npm run lint` e `npm run test:meus-cursos` em `frontend/`.
