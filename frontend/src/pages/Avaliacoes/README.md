# Avaliações

A página `/avaliacoes` usa a API autenticada do colaborador. Exibe apenas avaliações dos cursos em que a conta se inscreveu. Os oito itens em `tests/fixtures/avaliacoes.fixture.ts` continuam como dados de referência para testes do protótipo e não alimentam a tela.

`assessmentApi.ts` valida as respostas de `GET /api/colaborador/avaliacoes` e envia tentativas completas por `POST /api/colaborador/avaliacoes/{id}/tentativas`. A API calcula e persiste nota, aprovação e respostas; o frontend apenas mostra o resultado. O gabarito não chega ao navegador antes da aprovação, mesmo após esgotar as tentativas. Uma tentativa só é consumida no envio. As escolhas em edição ficam em memória e podem ser retomadas ao navegar dentro da sessão, mas se perdem ao recarregar ou sair da conta.

O diálogo, filtros, indicadores e gráfico foram reaproveitados. O gráfico utiliza as notas registradas pela API. A busca e os filtros continuam locais. Durante a avaliação, **Voltar às aulas** retorna à aula de origem quando a avaliação foi aberta pela página de estudo; o botão de avaliação permite retomar as respostas ainda em memória. Em caso de falha ao carregar, há uma ação para tentar novamente; em falha no envio, as escolhas atuais são preservadas para nova tentativa de envio.

LGPD na Prática tem seis questões; Introdução à Inteligência Artificial, Gestão de Projetos Ágeis com Scrum, Cloud Computing Essencial, Comunicação Assertiva no Ambiente de Trabalho e Introdução à Criptografia têm 18, com seis relacionadas a cada aula; Segurança da Informação e Computação em Nuvem têm cinco. Cada questão tem quatro alternativas, nota mínima de 80% e duas tentativas. Os oito cursos têm emissão de certificado habilitada. Scrum usa o tema `projects`, com o ícone de projetos do catálogo. A estimativa de duração considera a quantidade de questões, com um mínimo de oito minutos.

Após a aprovação, o resultado consulta os certificados emitidos pela API e exibe o certificado do curso, com visualização no próprio diálogo e download em PDF. A mensagem de disponibilidade só aparece quando o certificado é encontrado. Falhas na consulta ou um certificado ainda ausente permitem consultar novamente sem reenviar a avaliação. Na reprovação, as tentativas restantes aparecem junto da nota, e o gabarito permanece oculto até a aprovação.

Verificação: `npm run test:avaliacoes`, `npm run build` e `npm run lint` em `frontend/`.

## Respostas ainda não enviadas

Fechar a avaliação ou sair dela por navegação solicita confirmação quando existem respostas em edição. Cancelar mantém a tela e as respostas. Confirmar permite sair e retomar durante a mesma sessão. Recarregar/fechar a página aciona o aviso nativo do navegador; sair da conta e atualizar as avaliações também exigem confirmação antes de descartar respostas. O navegador controla o texto do aviso de recarregamento. Isso não é salvamento automático das respostas no servidor.

O botão **Atualizar avaliações** consulta novamente o limite individual, incluindo oportunidades liberadas pelo RH. A migração V26 mantém as duas tentativas padrão e acrescenta somente as autorizações daquele colaborador e curso.

Comunicação Assertiva usa o tema `communication`, com ícone de conversa. As questões 1–6 correspondem aos fundamentos; 7–12 a feedback e conversas difíceis; 13–18 à comunicação em equipe.

Introdução à Criptografia usa o tema `security`. As questões 1–6 cobrem fundamentos; 7–12, criptografia simétrica, assimétrica e hash; 13–18, HTTPS, senhas e assinaturas digitais. As três videoaulas estão em `/videos/criptografia-aula-1.mp4`, `/videos/criptografia-aula-2.mp4` e `/videos/criptografia-aula-3.mp4`.

Fundamentos da Gestão do Tempo reutiliza o cadastro antes chamado Gestão do Tempo e Prioridades. Tem três videoaulas e 18 questões, seis por aula, com quatro alternativas, explicações, nota mínima de 80% e duas tentativas. A aprovação emite certificado. O tema `workspace` usa um ícone de relógio. Os vídeos estão em `/videos/gestao-tempo-aula-1.mp4`, `/videos/gestao-tempo-aula-2.mp4` e `/videos/gestao-tempo-aula-3.mp4`.
