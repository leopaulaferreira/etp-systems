# Meus Cursos

A página `/meus-cursos` usa `GET /api/colaborador/meus-cursos` com o token da conta atual. O catálogo permite iniciar uma inscrição por `POST /api/colaborador/inscricoes/cursos/{cursoId}` e, após a confirmação, oferece o link para Meus Cursos.

- **A estudar** mostra cursos inscritos ainda abaixo de 100%. Cursos com avanço parcial aparecem no destaque “Continue de onde parou”.
- **Concluídos** mostra cursos em 100%, com a data registrada pela API.
- O diálogo de um curso inscrito oferece **Abrir aula**. Na página de estudo, **Concluir aula** registra a conclusão no banco e atualiza o percentual calculado pelo servidor.
- LGPD, IA, Scrum e Cloud Computing Essencial têm três videoaulas. Outros dois cursos piloto têm resumo e avaliação. Os demais mostram que o conteúdo ainda está em preparação.
- **Salvos** é um estado local temporário da interface e recomeça vazio ao recarregar. Salvar um curso não cria uma inscrição.
- As sugestões vêm do catálogo real e não incluem cursos já inscritos.
- Falhas ao carregar inscrições mostram uma opção de tentar novamente. Dados de outro usuário ou do mock não substituem a lista real.

A página de estudo lista as aulas concluídas e o total registrado. A conclusão é declarada pelo colaborador, sem medição automática do tempo de vídeo. Concluir todas as aulas não emite certificado; é necessária aprovação na avaliação. Certificados já emitidos preservam o curso em 100%, independentemente da contagem de aulas. Percentuais legados são preservados até a primeira conclusão de aula em cursos sem certificado, quando passam a ser recalculados.

Validação: `npm run build`, `npm run lint` e `npm run test:meus-cursos` em `frontend/`.

O progresso agora é registrado pelo botão **Concluir aula** na página de estudo. A API calcula o percentual pelas conclusões persistidas; o diálogo de Meus Cursos não oferece mais ajuste manual. Concluir as aulas não substitui a aprovação na avaliação para emissão do certificado.

## Retomar a última aula

Ao abrir um curso sem `?aula=`, a página retoma a última aula visitada pela conta nesse navegador. A preferência fica em `localStorage`, separada por ID de usuário e curso. Um link explícito para uma aula tem prioridade. Se a aula tiver sido removida ou o armazenamento estiver bloqueado, a página abre a primeira aula. A preferência não marca aulas como concluídas e não é sincronizada entre dispositivos.

## Disponibilidade de aulas

As listas priorizam cursos com `lessonCount > 0`, preservando a ordem original dentro de cada grupo. A API conta as aulas cadastradas em lote para os cursos inscritos, incluindo aulas em texto e vídeo. A indicação de disponibilidade aparece abaixo do título; o destaque de retomada considera apenas cursos com aulas. Novas aulas passam a contar na próxima consulta, sem manter uma lista fixa de títulos no frontend.
