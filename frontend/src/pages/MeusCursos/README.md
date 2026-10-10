# Meus Cursos

A página `/meus-cursos` usa `GET /api/colaborador/meus-cursos` com o token da conta atual. O catálogo permite iniciar uma inscrição por `POST /api/colaborador/inscricoes/cursos/{cursoId}` e, após a confirmação, oferece o link para Meus Cursos.

- **A estudar** mostra cursos inscritos ainda abaixo de 100%. Cursos com avanço parcial aparecem no destaque “Continue de onde parou”.
- **Concluídos** mostra cursos em 100%, com a data registrada pela API.
- No diálogo de um curso inscrito, o colaborador atualiza manualmente seu percentual. A alteração é salva por `PUT /api/colaborador/meus-cursos/{cursoId}/progresso` e aparece após recarregar a página.
- O botão **Abrir aula** leva à página de estudo do curso. LGPD na Prática tem duas videoaulas e avaliação; outros dois cursos piloto têm resumo e avaliação. Os demais mostram que o conteúdo ainda está em preparação.
- **Salvos** é um estado local temporário da interface e recomeça vazio ao recarregar. Salvar um curso não cria uma inscrição.
- As sugestões vêm do catálogo real e não incluem cursos já inscritos.
- Falhas ao carregar inscrições mostram uma opção de tentar novamente. Dados de outro usuário ou do mock não substituem a lista real.

Os dados de `../../mocks/meus-cursos.mock.ts` permanecem no repositório como referência do protótipo, mas não alimentam a página autenticada. A página de estudo suporta vídeo opcional; as duas primeiras aulas de LGPD já usam MP4. Ainda não há medição automática de progresso: o percentual é informado pelo próprio colaborador. Marcar 100% registra a conclusão do progresso, mas não emite certificado. Certificados dependem da aprovação em uma avaliação de curso habilitado; LGPD ainda aguarda a terceira videoaula e a liberação da certificação.

Validação: `npm run build`, `npm run lint` e `npm run test:meus-cursos` em `frontend/`.
