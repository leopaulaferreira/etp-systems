-- Questões 1–6: fundamentos; 7–12: prioridades; 13–18: produtividade.
UPDATE cursos SET certificacao_habilitada = TRUE WHERE titulo = 'Fundamentos da Gestão do Tempo';

INSERT INTO avaliacoes (id, curso_id, titulo, nota_minima, limite_tentativas)
SELECT UUID(), c.id, 'Avaliação: Fundamentos da Gestão do Tempo', 80, 2
FROM cursos c
WHERE c.titulo = 'Fundamentos da Gestão do Tempo'
  AND NOT EXISTS (SELECT 1 FROM avaliacoes a WHERE a.curso_id = c.id);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS ordem, 'O que significa gerir melhor o tempo?' AS enunciado, 'Gestão do tempo não cria mais horas no dia; ela ajuda a organizar melhor como o tempo disponível é utilizado.' AS explicacao
    UNION ALL SELECT 2, 'Qual é a principal diferença entre estar ocupado e ser produtivo?', 'Estar ocupado não garante resultados. Ser produtivo envolve avançar nas atividades que contribuem para objetivos relevantes.'
    UNION ALL SELECT 3, 'Qual prática ajuda a organizar melhor a rotina?', 'Listar tarefas e organizar compromissos ajuda a visualizar as demandas e planejar o uso do tempo disponível.'
    UNION ALL SELECT 4, 'Por que definir objetivos claros pode ajudar na gestão do tempo?', 'Objetivos claros orientam as decisões sobre onde concentrar tempo e energia, sem eliminar imprevistos ou aumentar as horas do dia.'
    UNION ALL SELECT 5, 'Qual situação pode ser considerada um desperdiçador de tempo?', 'Notificações sem importância interrompem o trabalho e dificultam manter o foco nas atividades relevantes.'
    UNION ALL SELECT 6, 'O que pode acontecer quando uma pessoa alterna constantemente entre várias tarefas?', 'Trocas frequentes entre tarefas exigem retomar o contexto e podem prejudicar a concentração.'
    UNION ALL SELECT 7, 'Qual é a principal diferença entre uma tarefa urgente e uma tarefa importante?', 'Urgência envolve a necessidade de atenção rápida; importância considera a contribuição da atividade para os objetivos.'
    UNION ALL SELECT 8, 'Na Matriz de Eisenhower, o que normalmente deve ser feito com uma tarefa urgente e importante?', 'Tarefas urgentes e importantes exigem atenção prioritária por combinarem impacto relevante e necessidade de ação rápida.'
    UNION ALL SELECT 9, 'Como deve ser tratada uma tarefa importante, mas não urgente?', 'Planejar tarefas importantes antes de se tornarem urgentes ajuda a avançar nos objetivos e reduzir emergências evitáveis.'
    UNION ALL SELECT 10, 'O que pode ser feito com uma tarefa urgente, mas pouco importante?', 'Delegar ou simplificar, quando adequado, ajuda a atender à demanda sem comprometer desnecessariamente as prioridades principais.'
    UNION ALL SELECT 11, 'Qual prática ajuda a definir prioridades para o dia?', 'Selecionar poucas prioridades principais facilita concentrar esforços e organizar as demais atividades de forma realista.'
    UNION ALL SELECT 12, 'Antes de interromper uma tarefa importante por causa de uma nova solicitação, qual pergunta pode ajudar na decisão?', 'Verificar a urgência real de uma solicitação ajuda a decidir se é necessário interromper a atividade atual ou planejar o atendimento.'
    UNION ALL SELECT 13, 'O que significa produtividade dentro do contexto da aula?', 'Produtividade envolve progresso nas atividades importantes com organização e sustentabilidade, e não apenas volume de tarefas.'
    UNION ALL SELECT 14, 'Qual é uma vantagem de reservar períodos específicos de foco?', 'Reservar períodos de foco favorece a concentração em uma atividade e reduz interrupções desnecessárias.'
    UNION ALL SELECT 15, 'Por que pode ser útil agrupar tarefas semelhantes?', 'Agrupar tarefas semelhantes reduz a necessidade de alternar repetidamente entre contextos diferentes.'
    UNION ALL SELECT 16, 'Qual é uma boa prática para lidar com notificações durante uma tarefa importante?', 'Reduzir notificações durante períodos de foco ajuda a proteger a atenção dedicada à atividade importante.'
    UNION ALL SELECT 17, 'O que caracteriza uma reunião mais produtiva?', 'Objetivo claro, participantes necessários e próximos passos definidos ajudam a tornar a reunião útil e orientada a resultados.'
    UNION ALL SELECT 18, 'Qual prática pode ajudar a melhorar continuamente a organização da rotina?', 'Revisar resultados e pendências permite ajustar o planejamento e definir prioridades para os próximos períodos.'
 ) pergunta
WHERE c.titulo = 'Fundamentos da Gestão do Tempo'
  AND NOT EXISTS (
      SELECT 1 FROM questoes q WHERE q.avaliacao_id = a.id AND q.ordem = pergunta.ordem
  );

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, opcao.texto, opcao.correta, opcao.ordem
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS questao, 0 AS ordem, 'Trabalhar mais horas todos os dias' AS texto, 0 AS correta
    UNION ALL SELECT 1, 1, 'Utilizar melhor o tempo disponível para atividades importantes', 1
    UNION ALL SELECT 1, 2, 'Eliminar completamente os imprevistos', 0
    UNION ALL SELECT 1, 3, 'Realizar várias tarefas ao mesmo tempo', 0
    UNION ALL SELECT 2, 0, 'Pessoas ocupadas sempre produzem mais', 0
    UNION ALL SELECT 2, 1, 'Produtividade está relacionada ao avanço em tarefas relevantes e objetivos', 1
    UNION ALL SELECT 2, 2, 'Estar ocupado significa trabalhar menos', 0
    UNION ALL SELECT 2, 3, 'Não existe diferença entre os dois conceitos', 0
    UNION ALL SELECT 3, 0, 'Começar o dia sem nenhum planejamento', 0
    UNION ALL SELECT 3, 1, 'Listar tarefas e organizar compromissos', 1
    UNION ALL SELECT 3, 2, 'Responder imediatamente a todas as notificações', 0
    UNION ALL SELECT 3, 3, 'Evitar definir objetivos', 0
    UNION ALL SELECT 4, 0, 'Porque elimina todas as tarefas secundárias', 0
    UNION ALL SELECT 4, 1, 'Porque ajuda a direcionar tempo e energia para resultados importantes', 1
    UNION ALL SELECT 4, 2, 'Porque impede que surjam imprevistos', 0
    UNION ALL SELECT 4, 3, 'Porque aumenta automaticamente a quantidade de horas disponíveis', 0
    UNION ALL SELECT 5, 0, 'Planejar as atividades do dia', 0
    UNION ALL SELECT 5, 1, 'Trabalhar com um objetivo definido', 0
    UNION ALL SELECT 5, 2, 'Ser interrompido constantemente por notificações sem importância', 1
    UNION ALL SELECT 5, 3, 'Reservar períodos para tarefas importantes', 0
    UNION ALL SELECT 6, 0, 'A concentração pode ser prejudicada', 1
    UNION ALL SELECT 6, 1, 'Todas as tarefas são concluídas mais rapidamente', 0
    UNION ALL SELECT 6, 2, 'A necessidade de planejamento desaparece', 0
    UNION ALL SELECT 6, 3, 'O trabalho se torna automaticamente mais simples', 0
    UNION ALL SELECT 7, 0, 'Toda tarefa urgente é importante', 0
    UNION ALL SELECT 7, 1, 'Urgência está relacionada à necessidade de atenção rápida, enquanto importância está ligada ao impacto nos objetivos', 1
    UNION ALL SELECT 7, 2, 'Tarefas importantes nunca possuem prazo', 0
    UNION ALL SELECT 7, 3, 'Tarefas urgentes podem sempre ser ignoradas', 0
    UNION ALL SELECT 8, 0, 'Eliminar', 0
    UNION ALL SELECT 8, 1, 'Fazer primeiro', 1
    UNION ALL SELECT 8, 2, 'Adiar indefinidamente', 0
    UNION ALL SELECT 8, 3, 'Ignorar', 0
    UNION ALL SELECT 9, 0, 'Deve ser planejada', 1
    UNION ALL SELECT 9, 1, 'Deve ser eliminada', 0
    UNION ALL SELECT 9, 2, 'Deve ser feita apenas quando surgir uma emergência', 0
    UNION ALL SELECT 9, 3, 'Deve ser sempre delegada', 0
    UNION ALL SELECT 10, 0, 'Sempre abandonar a tarefa', 0
    UNION ALL SELECT 10, 1, 'Avaliar a possibilidade de delegar ou simplificar', 1
    UNION ALL SELECT 10, 2, 'Transformá-la automaticamente em prioridade máxima', 0
    UNION ALL SELECT 10, 3, 'Fazer antes de qualquer tarefa importante', 0
    UNION ALL SELECT 11, 0, 'Tratar todas as atividades como prioridade máxima', 0
    UNION ALL SELECT 11, 1, 'Escolher poucas prioridades principais e organizar as demais tarefas', 1
    UNION ALL SELECT 11, 2, 'Trabalhar apenas nas tarefas mais fáceis', 0
    UNION ALL SELECT 11, 3, 'Ignorar prazos', 0
    UNION ALL SELECT 12, 0, 'Essa solicitação realmente precisa ser feita agora?', 1
    UNION ALL SELECT 12, 1, 'Quem enviou a mensagem primeiro?', 0
    UNION ALL SELECT 12, 2, 'Qual tarefa parece mais simples?', 0
    UNION ALL SELECT 12, 3, 'Quantas notificações chegaram hoje?', 0
    UNION ALL SELECT 13, 0, 'Trabalhar continuamente sem fazer pausas', 0
    UNION ALL SELECT 13, 1, 'Fazer o maior número possível de tarefas', 0
    UNION ALL SELECT 13, 2, 'Avançar nas atividades importantes de forma organizada e sustentável', 1
    UNION ALL SELECT 13, 3, 'Responder imediatamente a todas as solicitações', 0
    UNION ALL SELECT 14, 0, 'Reduzir a necessidade de concluir tarefas', 0
    UNION ALL SELECT 14, 1, 'Melhorar a concentração em uma atividade', 1
    UNION ALL SELECT 14, 2, 'Eliminar completamente as pausas', 0
    UNION ALL SELECT 14, 3, 'Aumentar o número de interrupções', 0
    UNION ALL SELECT 15, 0, 'Para reduzir trocas constantes de contexto', 1
    UNION ALL SELECT 15, 1, 'Para evitar o uso de agendas', 0
    UNION ALL SELECT 15, 2, 'Para eliminar todas as atividades administrativas', 0
    UNION ALL SELECT 15, 3, 'Para trabalhar em várias tarefas ao mesmo tempo', 0
    UNION ALL SELECT 16, 0, 'Verificar cada notificação assim que chegar', 0
    UNION ALL SELECT 16, 1, 'Silenciar ou reduzir notificações durante períodos de foco', 1
    UNION ALL SELECT 16, 2, 'Manter todos os aplicativos abertos', 0
    UNION ALL SELECT 16, 3, 'Interromper a tarefa sempre que receber uma mensagem', 0
    UNION ALL SELECT 17, 0, 'Não possuir horário para terminar', 0
    UNION ALL SELECT 17, 1, 'Ter objetivo claro, participantes necessários e próximos passos definidos', 1
    UNION ALL SELECT 17, 2, 'Incluir o maior número possível de pessoas', 0
    UNION ALL SELECT 17, 3, 'Ser realizada para qualquer tipo de solicitação', 0
    UNION ALL SELECT 18, 0, 'Nunca revisar tarefas já planejadas', 0
    UNION ALL SELECT 18, 1, 'Revisar o que foi concluído, o que ficou pendente e o que precisa ser prioridade depois', 1
    UNION ALL SELECT 18, 2, 'Preencher toda a agenda sem nenhum espaço livre', 0
    UNION ALL SELECT 18, 3, 'Evitar mudanças no planejamento', 0
 ) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'Fundamentos da Gestão do Tempo'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
